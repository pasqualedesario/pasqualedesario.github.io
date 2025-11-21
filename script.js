// Update footer datetime - functions defined before DOMContentLoaded
let currentTemperature = null;
let isFirstUpdate = true;

function buildFooterDateTimeHtml(now) {
    const day = now.getDate();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timezone = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
        .formatToParts(now)
        .find(part => part.type === 'timeZoneName')?.value || 'UTC';
    
    let html = `bari, <span class="num">${day}</span> ${month} <span class="num">${year}</span>, <span class="num">${hours}</span>:<span class="num">${minutes}</span>:<span class="num">${seconds}</span> ${timezone.toLowerCase()}`;
    if (currentTemperature !== null) {
        html += `, <span class="num">${currentTemperature}</span><span class="grado-basso">°</span>c`;
    } else {
        html += `, <span class="num">--</span><span class="grado-basso">°</span>c`;
    }
    return html;
}

async function fetchTemperature() {
    try {
        // Using Open-Meteo API (no API key required)
        // Coordinates for Bari: 41.1171, 16.8719
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&current_weather=true');
        const data = await response.json();
        if (data.current_weather && data.current_weather.temperature !== undefined) {
            currentTemperature = Math.round(data.current_weather.temperature);
            // Update immediately after first fetch
            if (isFirstUpdate) {
                updateFooterDateTime();
                isFirstUpdate = false;
            }
        }
    } catch (error) {
        console.error('Error fetching temperature:', error);
    }
}

function updateFooterDateTime() {
    const now = new Date();
    const dateTimeString = buildFooterDateTimeHtml(now);
    const dateTimeElements = document.querySelectorAll('.footer-datetime');
    dateTimeElements.forEach(el => {
        el.innerHTML = dateTimeString;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const projectsContainer = document.getElementById('projects');
    const initialSections = Array.from(projectsContainer.querySelectorAll('.project'));
    const shuffledSections = shuffle(initialSections);
    shuffledSections.forEach(section => projectsContainer.appendChild(section));

    const sections = shuffledSections;
    const fixedTitle = document.querySelector('.project-title-fixed');
    const fixedInfo = document.querySelector('.project-info-fixed');
    const progressElement = document.querySelector('.project-progress');
    const progressCurrent = document.querySelector('.project-progress-current');
    const progressTotal = document.querySelector('.project-progress-total');
    const SWIPE_THRESHOLD = 40;

    const galleryStates = new Map();
    let currentIndex = 0;
    let ticking = false;
    let lastProjectFirstAlignment = null; // Traccia l'allineamento del primo slide dell'ultimo progetto

    sections.forEach(section => {
        const wrapper = section.querySelector('.project-gallery');
        if (!wrapper) {
            return;
        }

        const sources = parseImageSources(section);
        if (sources.length === 0) {
            return;
        }

        wrapper.innerHTML = '';

        const state = createGalleryState(wrapper, sources, lastProjectFirstAlignment);
        galleryStates.set(section, state);
        
        // Aggiorna l'allineamento del primo slide di questo progetto per il prossimo
        if (state.firstAlignment) {
            lastProjectFirstAlignment = state.firstAlignment;
        }

        wrapper.style.cursor = state.total <= 1 ? 'default' : 'crosshair';

        applyGalleryTransform(state, false);

        if (state.total > 1) {
            wrapper.addEventListener('click', (event) => {
                // Usa la posizione del click rispetto all'intera finestra
                const clickX = event.clientX;
                const halfWidth = window.innerWidth / 2;
                
                // Click sulla metà sinistra = vai indietro, metà destra = vai avanti
                const direction = clickX < halfWidth ? -1 : 1;
                changeSlide(section, direction);
            });

            setupSwipeHandlers(wrapper, section);
        }
    });

    // IntersectionObserver per forzare il play dei video quando entrano in viewport (importante per mobile)
    if ('IntersectionObserver' in window) {
        window.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.tagName === 'VIDEO' && video.paused) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                // Ignora errori di autoplay
                            });
                        }
                    }
                } else {
                    // Pausa il video quando esce dalla viewport per risparmiare risorse
                    const video = entry.target;
                    if (video.tagName === 'VIDEO' && !video.paused) {
                        video.pause();
                    }
                }
            });
        }, {
            threshold: 0.1, // Quando almeno il 10% del video è visibile (molto sensibile per mobile)
            rootMargin: '0px' // Nessun margine aggiuntivo
        });

        // Osserva tutti i video esistenti e futuri
        // I video creati dinamicamente verranno osservati quando vengono aggiunti al DOM
        const observeVideos = () => {
            sections.forEach(section => {
                const videos = section.querySelectorAll('video');
                videos.forEach(video => {
                    if (!video.dataset.observed) {
                        window.videoObserver.observe(video);
                        video.dataset.observed = 'true';
                    }
                });
            });
        };
        
        // Osserva i video iniziali
        observeVideos();
        
        // Osserva anche dopo un piccolo delay per catturare i video creati dinamicamente
        setTimeout(observeVideos, 500);
    }

    function createGalleryState(wrapper, sources, lastProjectFirstAlignment) {
        const state = {
            wrapper,
            images: sources,
            total: sources.length,
            current: 0,
            position: 0,
            isTransitioning: false,
            transition: 'transform 0.6s ease',
            firstAlignment: null
        };

        const alignments = ['align-left', 'align-center', 'align-right'];
        let lastAlignmentInProject = null; // Traccia l'ultimo allineamento all'interno di questo progetto

        const pickAlignment = (isFirstSlide) => {
            let choices;
            
            if (isFirstSlide) {
                // Per il primo slide, evita l'allineamento dell'ultimo progetto
                choices = lastProjectFirstAlignment 
                    ? alignments.filter(alignment => alignment !== lastProjectFirstAlignment)
                    : alignments;
            } else {
                // Per gli altri slide, evita solo l'ultimo allineamento all'interno di questo progetto
                choices = lastAlignmentInProject 
                    ? alignments.filter(alignment => alignment !== lastAlignmentInProject)
                    : alignments;
            }
            
            const alignment = choices[Math.floor(Math.random() * choices.length)];
            lastAlignmentInProject = alignment;
            
            if (isFirstSlide) {
                state.firstAlignment = alignment;
            }
            
            return alignment;
        };

        const stripHtml = (html) => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            return temp.textContent || temp.innerText || '';
        };

        const createSlide = (src, alignment, index) => {
            const slide = document.createElement('div');
            slide.className = `project-slide ${alignment}`;

            // Rileva se è video o immagine dall'estensione
            const ext = src.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

            if (isVideo) {
                // Crea elemento video
                const video = document.createElement('video');
                video.setAttribute('autoplay', '');
                video.setAttribute('muted', '');
                video.setAttribute('playsinline', '');
                video.setAttribute('loop', '');
                video.setAttribute('preload', 'auto');
                video.setAttribute('webkit-playsinline', '');
                video.autoplay = true;
                video.muted = true;
                video.playsInline = true;
                video.loop = true;
                video.preload = 'auto';
                video.draggable = false;
                
                const source = document.createElement('source');
                source.src = src;
                source.type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
                
                video.appendChild(source);
                
                // Previeni click destro e apertura in nuova tab
                video.addEventListener('contextmenu', (e) => e.preventDefault());
                video.addEventListener('dragstart', (e) => e.preventDefault());
                // Previeni play/pause al click
                video.addEventListener('click', (e) => e.preventDefault());
                video.style.userSelect = 'none';
                video.style.pointerEvents = 'none';
                
                // Forza il play quando il video è caricato (importante per mobile)
                const tryPlay = () => {
                    if (video.paused) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                // Ignora errori di autoplay, il video partirà quando visibile
                            });
                        }
                    }
                };
                
                video.addEventListener('loadedmetadata', tryPlay);
                video.addEventListener('canplay', tryPlay);
                video.addEventListener('loadeddata', () => {
                    // Piccolo delay per assicurarsi che tutto sia pronto
                    setTimeout(tryPlay, 100);
                });
                
                slide.appendChild(video);
                video.style.userSelect = 'none';
                
                // Osserva il video quando viene aggiunto al DOM
                if ('IntersectionObserver' in window && window.videoObserver) {
                    window.videoObserver.observe(video);
                }

            } else {
                // Crea elemento immagine
                const img = document.createElement('img');
                img.src = src;
                const rawTitle = wrapper.parentElement?.getAttribute('data-title') || '';
                const plainTitle = stripHtml(rawTitle).trim();
                img.alt = plainTitle ? `${plainTitle} — image ${index + 1}` : `project image ${index + 1}`;
                img.decoding = 'async';
                img.loading = 'lazy';
                img.draggable = false;
                
                // Previeni click destro e apertura in nuova tab
                img.addEventListener('contextmenu', (e) => e.preventDefault());
                img.addEventListener('dragstart', (e) => e.preventDefault());
                img.style.userSelect = 'none';
                img.style.pointerEvents = 'none';

                slide.appendChild(img);
            }
            
            return slide;
        };

        sources.forEach((src, index) => {
            const alignment = pickAlignment(index === 0);
            wrapper.appendChild(createSlide(src, alignment, index));
        });

        wrapper.style.transition = state.transition;
        return state;
    }

    function parseImageSources(section) {
        const attr = section.dataset.images || section.getAttribute('data-bg') || '';
        return attr
            .split('|')
            .map(src => src.trim())
            .filter(Boolean);
    }

    function applyGalleryTransform(state, animate = true) {
        const offset = -100 * state.position;

        if (!animate) {
            state.wrapper.style.transition = 'none';
            state.wrapper.style.transform = `translateX(${offset}%)`;
            void state.wrapper.offsetWidth;
            state.wrapper.style.transition = state.transition;
        } else {
            state.wrapper.style.transition = state.transition;
            state.wrapper.style.transform = `translateX(${offset}%)`;
        }
    }

    function changeSlide(section, direction) {
        const state = galleryStates.get(section);
        if (!state || state.total <= 1 || state.isTransitioning) {
            return;
        }

        const newPosition = state.position + direction;
        
        // Blocca lo scorrimento se si raggiunge l'inizio o la fine
        if (newPosition < 0 || newPosition >= state.total) {
            return;
        }

        state.isTransitioning = true;
        state.position = newPosition;
        state.current = newPosition;

        applyGalleryTransform(state, true);

        if (sections[currentIndex] === section) {
            updateProgress(section);
        }
        
        // Forza il play del video nel nuovo slide (importante per mobile)
        setTimeout(() => {
            const slides = section.querySelectorAll('.project-slide');
            const activeSlide = slides[newPosition];
            if (activeSlide) {
                const video = activeSlide.querySelector('video');
                if (video && video.paused) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            // Ignora errori di autoplay
                        });
                    }
                }
            }
        }, 100);
        
        // Reset transitioning state dopo l'animazione
        setTimeout(() => {
            state.isTransitioning = false;
        }, 600);
    }

    function setupSwipeHandlers(wrapper, section) {
        let startX = 0;
        let startY = 0;
        let tracking = false;
        let horizontal = false;

        wrapper.addEventListener('touchstart', event => {
            const state = galleryStates.get(section);
            if (!state || state.total <= 1) {
                return;
            }

            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            tracking = true;
            horizontal = false;
        }, { passive: true });

        wrapper.addEventListener('touchmove', event => {
            if (!tracking) {
                return;
            }

            const touch = event.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            if (!horizontal) {
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                    horizontal = true;
                } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    tracking = false;
                    return;
                }
            }

            if (horizontal) {
                event.preventDefault();
            }
        }, { passive: false });

        wrapper.addEventListener('touchend', event => {
            if (!tracking) {
                return;
            }

            const state = galleryStates.get(section);
            tracking = false;

            if (!state || state.total <= 1 || !horizontal) {
                horizontal = false;
                return;
            }

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - startX;

            if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
                changeSlide(section, deltaX < 0 ? 1 : -1);
            }

            horizontal = false;
        }, { passive: true });

        wrapper.addEventListener('touchcancel', () => {
            tracking = false;
            horizontal = false;
        });
    }

    function formatCounter(value) {
        return String(value).padStart(2, '0');
    }

    function updateProgress(section) {
        if (!progressCurrent || !progressTotal) {
            return;
        }

        const state = galleryStates.get(section);
        const total = state ? state.total : 1;
        const current = state ? state.current + 1 : 1;

        progressCurrent.textContent = formatCounter(current);
        progressTotal.textContent = formatCounter(total);
    }

    function adjustTitleSpacing() {
        if (!fixedTitle || !fixedInfo) {
            return;
        }

        if (window.innerWidth > 768) {
            fixedInfo.style.top = '';
            return;
        }

        fixedInfo.style.top = '';
        const infoStyle = window.getComputedStyle(fixedInfo);
        const baseTop = parseFloat(infoStyle.top);
        const titleStyle = window.getComputedStyle(fixedTitle);
        const lineHeight = parseFloat(titleStyle.lineHeight);
        const titleHeight = fixedTitle.scrollHeight;
        const extra = Math.max(0, titleHeight - lineHeight);

        if (extra > 0) {
            fixedInfo.style.top = `${baseTop + extra}px`;
        }
    }

    function setFixedOffset(index) {
        const total = sections.length;
        if (total === 0) {
            return;
        }

        const usableRange = window.innerHeight / 2;
        const step = total > 1 ? usableRange / (total - 1) : 0;
        const offset = step * index;

        if (fixedTitle) {
            fixedTitle.style.transform = `translateY(${offset}px)`;
            fixedTitle.style.transition = 'none';
        }

        if (fixedInfo) {
            fixedInfo.style.transform = `translateY(${offset}px)`;
            fixedInfo.style.transition = 'none';
        }

        if (progressElement) {
            progressElement.style.transform = `translateY(${offset}px)`;
            progressElement.style.transition = 'none';
        }
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTitle();
                ticking = false;
            });
            ticking = true;
        }
    }

    function updateTitle() {
        if (sections.length === 0) {
            return;
        }

        const vh = window.innerHeight;
        const midViewport = vh / 2;
        let activeIndex = 0;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= midViewport) {
                activeIndex = index;
            }
        });

        const activeSection = sections[activeIndex];

        if (activeIndex !== currentIndex) {
            currentIndex = activeIndex;

            if (fixedTitle) {
                const titleContent = activeSection.getAttribute('data-title');
                if (titleContent) {
                    fixedTitle.innerHTML = titleContent;
                }
            }

            if (fixedInfo) {
                const categoryContent = activeSection.getAttribute('data-category');
                const yearContent = activeSection.getAttribute('data-year');
                if (categoryContent || yearContent) {
                    fixedInfo.innerHTML = (categoryContent || '') + (categoryContent && yearContent ? '<br>' : '') + (yearContent || '');
                }
            }
        }

        setFixedOffset(activeIndex);
        updateProgress(activeSection);
        adjustTitleSpacing();
        
        // Forza il play del video nel primo slide del progetto attivo (importante per mobile)
        const state = galleryStates.get(activeSection);
        if (state) {
            const slides = activeSection.querySelectorAll('.project-slide');
            const activeSlide = slides[state.position];
            if (activeSlide) {
                const video = activeSlide.querySelector('video');
                if (video) {
                    // Forza il play anche se il video è già stato tentato
                    const playVideo = () => {
                        if (video.paused || video.readyState < 3) {
                            const playPromise = video.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(error => {
                                    // Ignora errori di autoplay, proverà di nuovo quando visibile
                                });
                            }
                        }
                    };
                    
                    // Prova immediatamente
                    playVideo();
                    
                    // Prova anche quando il video è pronto
                    if (video.readyState < 3) {
                        video.addEventListener('canplay', playVideo, { once: true });
                        video.addEventListener('loadeddata', playVideo, { once: true });
                    }
                }
            }
        }
    }

    if (fixedTitle && sections.length > 0) {
        const firstSection = sections[0];
        const firstTitle = firstSection.getAttribute('data-title');
        if (firstTitle) {
            fixedTitle.innerHTML = firstTitle;
        }
        setFixedOffset(0);
    }

    if (fixedInfo && sections.length > 0) {
        const firstSection = sections[0];
        const firstCategory = firstSection.getAttribute('data-category');
        const firstYear = firstSection.getAttribute('data-year');
        if (firstCategory || firstYear) {
            fixedInfo.innerHTML = (firstCategory || '') + (firstCategory && firstYear ? '<br>' : '') + (firstYear || '');
        }
    }

    if (sections.length > 0) {
        updateProgress(sections[0]);
    }

    window.scrollTo(0, 0);
    updateTitle();
    adjustTitleSpacing();

    window.addEventListener('keydown', event => {
        if (event.defaultPrevented) {
            return;
        }

        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
            return;
        }

        const activeSection = sections[currentIndex];
        if (!activeSection) {
            return;
        }

        const state = galleryStates.get(activeSection);
        if (!state || state.total <= 1) {
            return;
        }

        event.preventDefault();
        changeSlide(activeSection, event.key === 'ArrowRight' ? 1 : -1);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    const handleResize = () => {
        updateTitle();
        adjustTitleSpacing();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);

// Info overlay functionality
const infoTrigger = document.getElementById('info-trigger');
const infoOverlay = document.getElementById('info-overlay');

let scrollPosition = 0;

const lockScroll = () => {
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  // Su mobile iOS non bloccare lo scroll del body, solo prevenire scroll della pagina principale
  if (window.innerWidth <= 768) {
    // Non bloccare lo scroll su mobile per permettere scroll interno
    document.body.style.overflow = 'hidden';
  } else {
    document.body.classList.add('scroll-lock');
    document.body.style.top = `-${scrollPosition}px`;
  }
};

const unlockScroll = () => {
  if (window.innerWidth <= 768) {
    document.body.style.removeProperty('overflow');
  } else {
    document.body.classList.remove('scroll-lock');
    document.body.style.removeProperty('top');
    window.scrollTo(0, scrollPosition);
  }
};

const openInfo = () => {
  if (!infoOverlay.classList.contains('active')) {
    infoOverlay.classList.add('active');
    lockScroll();
  }
  // Non usare window.location.hash; aggiorna l’URL senza scroll
  history.pushState({ info: true }, '', '#info');
};

const closeInfo = () => {
  if (infoOverlay.classList.contains('active')) {
    infoOverlay.classList.remove('active');
    unlockScroll();
  }
  history.pushState({ info: false }, '', window.location.pathname + window.location.search);
};

if (infoTrigger && infoOverlay) {
  infoTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (infoOverlay.classList.contains('active')) {
      closeInfo();
    } else {
      openInfo();
    }
  });

  infoOverlay.addEventListener('click', (e) => {
    if (e.target === infoOverlay || e.target.classList.contains('info-overlay-blur')) {
      closeInfo();
    }
  });

  window.addEventListener('popstate', () => {
    if (window.location.hash === '#info') {
      openInfo();
    } else {
      closeInfo();
    }
  });

  if (window.location.hash === '#info') {
    openInfo();
  }

  // Wrap em-dashes in footer marquee (do this once before datetime updates)
  wrapFooterDashes();
}

// Initialize and update footer datetime every second
function updateFooterDateTimeCached() {
    // Query elements every time to ensure we get all elements
    const footerDateTimeElements = document.querySelectorAll('.footer-datetime');
    if (footerDateTimeElements.length > 0) {
        const now = new Date();
        const dateTimeString = buildFooterDateTimeHtml(now);
        footerDateTimeElements.forEach(el => {
            el.innerHTML = dateTimeString;
        });
    }
}

// Start updating after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initial update after a small delay to ensure DOM is ready
        setTimeout(() => {
            updateFooterDateTimeCached();
            setInterval(updateFooterDateTimeCached, 1000);
        }, 100);
    });
} else {
    // DOM is already loaded
    updateFooterDateTimeCached();
    setInterval(updateFooterDateTimeCached, 1000);
}

// Fetch temperature on load and every 10 minutes
fetchTemperature();
setInterval(fetchTemperature, 600000); // 10 minutes

// Raise em-dash by 1px in footer marquee
// Call this inside DOMContentLoaded to ensure it runs before datetime updates
function wrapFooterDashes() {
    const items = document.querySelectorAll('.footer-marquee-text');
    items.forEach((el) => {
        // Only replace if not already wrapped to avoid interfering with datetime updates
        if (!el.innerHTML.includes('<span class="emdash">')) {
            el.innerHTML = el.innerHTML.replace(/—/g, '<span class="emdash">—</span>');
        }
    });
}

function shuffle(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
});
