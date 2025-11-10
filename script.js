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
    let globalLastAlignment = null; // Traccia l'ultimo allineamento globale

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

        const state = createGalleryState(wrapper, sources);
        galleryStates.set(section, state);

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

    function createGalleryState(wrapper, sources) {
        const state = {
            wrapper,
            images: sources,
            total: sources.length,
            current: 0,
            position: 0,
            isTransitioning: false,
            transition: 'transform 0.6s ease'
        };

        const alignments = ['align-left', 'align-center', 'align-right'];

        const pickAlignment = () => {
            const choices = alignments.filter(alignment => alignment !== globalLastAlignment);
            const alignment = choices[Math.floor(Math.random() * choices.length)];
            globalLastAlignment = alignment;
            return alignment;
        };

        const createSlide = (src, alignment) => {
            const slide = document.createElement('div');
            slide.className = `project-slide ${alignment}`;

            // Rileva se è video o immagine dall'estensione
            const ext = src.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

            if (isVideo) {
                // Crea elemento video
                const video = document.createElement('video');
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
                
                slide.appendChild(video);
                video.style.userSelect = 'none';

            } else {
                // Crea elemento immagine
                const img = document.createElement('img');
                img.src = src;
                img.alt = '';
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

        sources.forEach((src) => {
            const alignment = pickAlignment();
            wrapper.appendChild(createSlide(src, alignment));
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
    window.addEventListener('resize', updateTitle);
    window.addEventListener('load', updateTitle);

// Info overlay functionality
const infoTrigger = document.getElementById('info-trigger');
const infoOverlay = document.getElementById('info-overlay');

let scrollPosition = 0;

const lockScroll = () => {
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('scroll-lock');
  document.body.style.top = `-${scrollPosition}px`;
};

const unlockScroll = () => {
  document.body.classList.remove('scroll-lock');
  document.body.style.removeProperty('top');
  window.scrollTo(0, scrollPosition);
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
}

// Update footer datetime
let currentTemperature = null;
let isFirstUpdate = true;

// Fetch temperature for Bari
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

// Fetch temperature on load and every 10 minutes
fetchTemperature();
setInterval(fetchTemperature, 600000); // 10 minutes

function updateFooterDateTime() {
    const now = new Date();
    
    // Format: "bari, 10 nov 2025, 14:30:45 cet, 15°c"
    const day = now.getDate();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Get timezone abbreviation
    const timezone = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
        .formatToParts(now)
        .find(part => part.type === 'timeZoneName')?.value || 'UTC';
    
    let dateTimeString = `bari, ${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${timezone.toLowerCase()}`;

    // Add temperature if available (use placeholder to maintain width)
    if (currentTemperature !== null) {
        dateTimeString += `, ${currentTemperature}<span class="grado-basso">°</span>c`;
    } else {
        dateTimeString += `, --<span class="grado-basso">°</span>c`;
    }

    // Update all datetime elements (HTML, non textContent)
    const dateTimeElements = document.querySelectorAll('.footer-datetime');
    dateTimeElements.forEach(el => {
        el.innerHTML = dateTimeString;
    });
}

// Initialize and update every second
updateFooterDateTime();
setInterval(updateFooterDateTime, 1000);

function shuffle(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
});
