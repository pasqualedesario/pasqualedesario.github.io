// ========================================================================
// FOOTER DATETIME & TEMPERATURE
// ========================================================================

let currentTemperature = null;

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
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&current_weather=true');
        const data = await response.json();
        if (data.current_weather && data.current_weather.temperature !== undefined) {
            currentTemperature = Math.round(data.current_weather.temperature);
        }
    } catch (error) {
        console.error('Error fetching temperature:', error);
    }
}

// ========================================================================
// TRANSLATION SYSTEM (shared across all pages)
// ========================================================================

const translations = {
    en: {
        'info': 'Info',
        'about': 'Designer and independent researcher based in Bari (Italy). His practice explores <span class="hover-effect">typography in its form and structure, information and editorial design</span> and all the ways they interpolate each other within and without <span class="hover-effect">visual systems</span>. His research is oriented also towards <span class="hover-effect">design histories</span>, <span class="hover-effect">open tools</span> and <span class="hover-effect">learning collective ecosystems</span> outside the institutional walls.',
        'education': 'education',
        'communication-design': 'Communication Design',
        'industrial-design': 'Industrial Design',
        'iuav': 'Iuav University of Venice',
        'poliba': 'Polytechnic of Bari',
        'experience': 'experience',
        'services': 'services',
        'art-direction': 'Art Direction',
        'book-design': 'Book Design',
        'information-design': 'Information Design',
        'type-design': 'Type Design',
        'visual-identity': 'Visual Identity',
        'web-design': 'Web Design',
        'contact': 'mail',
        'platforms': 'platforms',
        'typeset-in': 'Typeset in',
        'cookies': 'This website doesn\u0026rsquo;t use third party cookies 🍪',
        'footer-cv': 'full cv and portfolio available upon request'
    },
    it: {
        'info': 'Info',
        'about': 'Designer e ricercatore indipendente di base a Bari. La sua pratica esplora <span class="hover-effect">la tipografia nella sua forma e struttura, l\u0026rsquo;information design e l\u0026rsquo;editoria</span> e tutte le modalità con le quali queste si interpolano all\u0026rsquo;interno e all\u0026rsquo;esterno dei <span class="hover-effect">sistemi visivi</span>. La sua ricerca è orientata anche alle <span class="hover-effect">storie del design</span>, agli <span class="hover-effect">strumenti aperti</span> e agli <span class="hover-effect">ecosistemi collettivi di apprendimento</span> al di fuori delle mura istituzionali.',
        'education': 'formazione',
        'communication-design': 'Design della comunicazione',
        'industrial-design': 'Disegno industriale',
        'iuav': 'Università Iuav di Venezia',
        'poliba': 'Politecnico di Bari',
        'experience': 'esperienza',
        'services': 'servizi',
        'art-direction': 'Art Direction',
        'book-design': 'Editoria',
        'information-design': 'Information Design',
        'type-design': 'Type Design',
        'visual-identity': 'Identità visiva',
        'web-design': 'Web Design',
        'contact': 'mail',
        'platforms': 'piattaforme',
        'typeset-in': 'Composto in',
        'cookies': 'Questo sito non utilizza cookie di terze parti 🍪',
        'footer-cv': 'cv e portfolio completi disponibili su richiesta'
    }
};

const projectMetadata = {
    en: {
        'mimmo-castellano': { category: 'Research — Book Design', year: '@Iuav, 2025' },
        'singolarita-multiple': { category: 'Research — Book Design', year: '@Iuav, 2024, w/ Jolanda Baudino, Chiara Lorenzo, Irene Mazzoleni' },
        'modernizzare-stanca': { category: 'Poster', year: '@Spazio Alelaie, 2024' },
        '4visions': { category: 'Visual Identity', year: '@MAT, 2023' },
        'meme-things-first': { category: 'Visual Identity — Book Design — Web Design & Development — Research — Curatorship', year: '@Iuav, 2024, w/ Rebecca Bertero & Serena de Mola' },
        'biennale-parola': { category: 'Book Design — Information Design', year: '@Iuav, 2024, w/ Giulia Gatta & Tommaso Antonelli' },
        'la-dimora-del-minotauro': { category: 'Artwork', year: '@Apparati Radicali, 2025' }
    },
    it: {
        'mimmo-castellano': { category: 'Ricerca — Editoria', year: '@Iuav, 2025' },
        'singolarita-multiple': { category: 'Ricerca — Editoria', year: '@Iuav, 2024, con Jolanda Baudino, Chiara Lorenzo, Irene Mazzoleni' },
        'modernizzare-stanca': { category: 'Manifesto', year: '@Spazio Alelaie, 2024' },
        '4visions': { category: 'Identità visiva', year: '@MAT, 2023' },
        'meme-things-first': { category: 'Identità visiva — Editoria — Web Design & Development — Ricerca — Curatela', year: '@Iuav, 2024, con Rebecca Bertero & Serena de Mola' },
        'biennale-parola': { category: 'Editoria — Information Design', year: '@Iuav, 2024, con Giulia Gatta & Tommaso Antonelli' },
        'la-dimora-del-minotauro': { category: 'Artwork', year: '@Apparati Radicali, 2025' }
    }
};

let currentLang = 'it';
let isChangingLanguage = false;

// These will be set by gallery init if on index page
let gallerySlides = [];
let galleryShuffledProjects = [];

function setLanguage(lang) {
    if (currentLang === lang) return;
    if (isChangingLanguage) return;

    isChangingLanguage = true;
    currentLang = lang;

    const newHash = lang === 'it' ? '#it' : '#en';
    if (window.location.hash !== newHash) {
        history.replaceState(null, '', newHash);
    }

    const htmlRoot = document.getElementById('html-root');
    if (htmlRoot) {
        htmlRoot.setAttribute('lang', lang);
    }

    const translatableElements = document.querySelectorAll('[data-lang]');
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Update project metadata if on gallery page
    if (gallerySlides.length > 0) {
        updateProjectMetadata(lang);
    }

    isChangingLanguage = false;
}

function updateProjectMetadata(lang) {
    const allEntries = document.querySelectorAll('#project-data .project-entry');
    allEntries.forEach(entry => {
        const projectId = entry.getAttribute('data-project-id');
        if (!projectId) return;

        if (projectMetadata[lang] && projectMetadata[lang][projectId]) {
            const metadata = projectMetadata[lang][projectId];
            if (metadata.category) entry.setAttribute('data-category', metadata.category);
            if (metadata.year) entry.setAttribute('data-year', metadata.year);
        }
    });

    let slideIdx = 0;
    galleryShuffledProjects.forEach(entry => {
        const category = entry.getAttribute('data-category') || '';
        const year = entry.getAttribute('data-year') || '';
        const imagesAttr = entry.getAttribute('data-images') || '';
        const sources = imagesAttr.split('|').map(s => s.trim()).filter(Boolean);

        sources.forEach(() => {
            if (slideIdx < gallerySlides.length) {
                gallerySlides[slideIdx].category = category;
                gallerySlides[slideIdx].year = year;
            }
            slideIdx++;
        });
    });

    if (typeof updateProjectInfo === 'function') {
        updateProjectInfo();
    }
}

function initializeLanguage() {
    const hash = window.location.hash.substring(1);
    if (hash === 'en') {
        currentLang = 'it';
        setLanguage('en');
    } else {
        currentLang = 'en';
        setLanguage('it');
    }
}

// ========================================================================
// MAIN APPLICATION
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // FOOTER: datetime, temperature, dashes
    // ====================================================================

    function updateFooterDateTimeCached() {
        const footerDateTimeElements = document.querySelectorAll('.footer-datetime');
        if (footerDateTimeElements.length > 0) {
            const now = new Date();
            const dateTimeString = buildFooterDateTimeHtml(now);
            footerDateTimeElements.forEach(el => {
                el.innerHTML = dateTimeString;
            });
        }
    }

    updateFooterDateTimeCached();
    setInterval(updateFooterDateTimeCached, 1000);

    fetchTemperature();
    setInterval(fetchTemperature, 600000);

    function wrapFooterDashes() {
        const items = document.querySelectorAll('.footer-marquee-text');
        items.forEach((el) => {
            if (!el.innerHTML.includes('<span class="emdash">')) {
                el.innerHTML = el.innerHTML.replace(/—/g, '<span class="emdash">—</span>');
            }
        });
    }
    wrapFooterDashes();

    // ====================================================================
    // LANGUAGE: switcher & hash routing
    // ====================================================================

    const langLinks = document.querySelectorAll('.lang-link');
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang-code');
            if (lang) setLanguage(lang);
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash === 'en' && currentLang !== 'en') {
            setLanguage('en');
        } else if ((hash === 'it' || hash === '') && currentLang !== 'it') {
            setLanguage('it');
        }
    });

    initializeLanguage();

    // ====================================================================
    // GALLERY (only on index page)
    // ====================================================================

    const galleryTrack = document.getElementById('gallery-track');
    if (!galleryTrack) return; // Not on gallery page (e.g. info.html)

    function shuffle(items) {
        const array = [...items];
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const projectEntries = Array.from(document.querySelectorAll('#project-data .project-entry'));
    galleryShuffledProjects = shuffle(projectEntries);

    galleryShuffledProjects.forEach(entry => {
        const projectId = entry.getAttribute('data-project-id');
        const title = entry.getAttribute('data-title') || '';
        const category = entry.getAttribute('data-category') || '';
        const year = entry.getAttribute('data-year') || '';
        const imagesAttr = entry.getAttribute('data-images') || '';
        const sources = imagesAttr.split('|').map(s => s.trim()).filter(Boolean);

        sources.forEach(src => {
            gallerySlides.push({ src, projectId, title, category, year });
        });
    });

    const slides = gallerySlides;
    const thumbnailTrack = document.getElementById('thumbnail-track');
    const titleEl = document.getElementById('project-title-bottom');
    const detailEl = document.getElementById('project-detail-bottom');

    let currentSlide = 0;
    let isTransitioning = false;

    function stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    slides.forEach((slide, index) => {
        // --- Main slide ---
        const slideEl = document.createElement('div');
        slideEl.className = 'gallery-slide';

        const ext = slide.src.split('.').pop().toLowerCase();
        const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

        if (isVideo) {
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
            source.src = slide.src;
            source.type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
            video.appendChild(source);

            video.addEventListener('contextmenu', e => e.preventDefault());
            video.addEventListener('dragstart', e => e.preventDefault());
            video.addEventListener('click', e => e.preventDefault());
            video.style.userSelect = 'none';
            video.style.pointerEvents = 'none';

            const tryPlay = () => {
                if (video.paused) {
                    const p = video.play();
                    if (p !== undefined) p.catch(() => { });
                }
            };
            video.addEventListener('loadedmetadata', tryPlay);
            video.addEventListener('canplay', tryPlay);
            video.addEventListener('loadeddata', () => setTimeout(tryPlay, 100));

            slideEl.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = slide.src;
            const plainTitle = stripHtml(slide.title).trim();
            img.alt = plainTitle ? `${plainTitle} — image ${index + 1}` : `project image ${index + 1}`;
            img.decoding = 'async';
            img.loading = index < 3 ? 'eager' : 'lazy';
            img.draggable = false;

            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('dragstart', e => e.preventDefault());
            img.style.userSelect = 'none';
            img.style.pointerEvents = 'none';

            slideEl.appendChild(img);
        }

        galleryTrack.appendChild(slideEl);

        // --- Thumbnail ---
        const thumbEl = document.createElement('div');
        thumbEl.className = 'thumbnail-item';
        thumbEl.dataset.index = index;

        if (isVideo) {
            const thumbVideo = document.createElement('video');
            thumbVideo.src = slide.src;
            thumbVideo.muted = true;
            thumbVideo.preload = 'metadata';
            thumbVideo.playsInline = true;
            thumbVideo.draggable = false;
            thumbVideo.addEventListener('contextmenu', e => e.preventDefault());
            thumbEl.appendChild(thumbVideo);
        } else {
            const thumbImg = document.createElement('img');
            thumbImg.src = slide.src;
            thumbImg.alt = '';
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            thumbImg.draggable = false;
            thumbImg.addEventListener('contextmenu', e => e.preventDefault());
            thumbEl.appendChild(thumbImg);
        }

        thumbEl.addEventListener('click', () => {
            goToSlide(index);
        });

        thumbnailTrack.appendChild(thumbEl);
    });

    // ====================================================================
    // GALLERY: Navigation
    // ====================================================================

    function goToSlide(index, animate = true) {
        if (index < 0 || index >= slides.length || (isTransitioning && animate)) return;

        isTransitioning = true;
        currentSlide = index;

        const offset = -100 * currentSlide;
        if (!animate) {
            galleryTrack.style.transition = 'none';
            galleryTrack.style.transform = `translateX(${offset}vw)`;
            void galleryTrack.offsetWidth;
            galleryTrack.style.transition = 'transform 0.6s ease';
        } else {
            galleryTrack.style.transition = 'transform 0.6s ease';
            galleryTrack.style.transform = `translateX(${offset}vw)`;
        }

        updateProjectInfo();
        updateActiveThumbnail();
        scrollThumbnailIntoView();

        setTimeout(() => {
            const allSlides = galleryTrack.querySelectorAll('.gallery-slide');
            const activeSlide = allSlides[currentSlide];
            if (activeSlide) {
                const video = activeSlide.querySelector('video');
                if (video && video.paused) {
                    const p = video.play();
                    if (p !== undefined) p.catch(() => { });
                }
            }
            isTransitioning = false;
        }, animate ? 600 : 50);
    }

    function changeSlide(direction) {
        const newIndex = currentSlide + direction;
        if (newIndex < 0 || newIndex >= slides.length) return;
        goToSlide(newIndex);
    }

    // Make updateProjectInfo available globally for translation updates
    window.updateProjectInfo = updateProjectInfo;
    function updateProjectInfo() {
        const slide = slides[currentSlide];
        if (!slide) return;

        if (titleEl) titleEl.innerHTML = slide.title;
        if (detailEl) {
            detailEl.innerHTML = (slide.category || '') +
                (slide.category && slide.year ? '<br>' : '') +
                (slide.year || '');
        }
        // Update layout metrics after content change (essential for mobile dynamic centering)
        requestAnimationFrame(updateLayoutMetrics);
    }

    function updateActiveThumbnail() {
        const thumbs = thumbnailTrack.querySelectorAll('.thumbnail-item');
        thumbs.forEach((t, i) => {
            t.classList.toggle('active', i === currentSlide);
        });
    }

    function scrollThumbnailIntoView() {
        const thumbs = thumbnailTrack.querySelectorAll('.thumbnail-item');
        const activeThumb = thumbs[currentSlide];
        if (!activeThumb) return;

        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const trackWidth = thumbnailTrack.clientWidth;

        thumbnailTrack.scrollLeft = thumbLeft - (trackWidth / 2) + (thumbWidth / 2);
    }

    // ====================================================================
    // GALLERY: Event handlers
    // ====================================================================

    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.addEventListener('click', (e) => {
        if (e.target.closest('#project-info-bottom')) return;

        const clickX = e.clientX;
        const halfWidth = window.innerWidth / 2;
        const direction = clickX < halfWidth ? -1 : 1;
        changeSlide(direction);
    });

    window.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            changeSlide(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            changeSlide(-1);
        }
    });

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let touchTracking = false;
    let touchHorizontal = false;
    const SWIPE_THRESHOLD = 40;

    galleryContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchTracking = true;
        touchHorizontal = false;
    }, { passive: true });

    galleryContainer.addEventListener('touchmove', (e) => {
        if (!touchTracking) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (!touchHorizontal) {
            if (absDeltaY > absDeltaX && absDeltaY > 15) {
                touchTracking = false;
                touchHorizontal = false;
                return;
            }
            if (absDeltaX > absDeltaY && absDeltaX > 20) {
                touchHorizontal = true;
            }
        }

        if (touchHorizontal && absDeltaX > absDeltaY) {
            e.preventDefault();
        }
    }, { passive: false });

    galleryContainer.addEventListener('touchend', (e) => {
        if (!touchTracking) {
            touchHorizontal = false;
            return;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;

        if (touchHorizontal && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
            changeSlide(deltaX < 0 ? 1 : -1);
        }

        touchTracking = false;
        touchHorizontal = false;
    }, { passive: true });

    galleryContainer.addEventListener('touchcancel', () => {
        touchTracking = false;
        touchHorizontal = false;
    });

    // Mouse wheel
    let wheelTimeout = null;
    galleryContainer.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(delta) < 10) return;

        e.preventDefault();

        if (wheelTimeout) return;

        const direction = delta > 0 ? 1 : -1;
        changeSlide(direction);

        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 600);
    }, { passive: false });

    // ====================================================================
    // VIDEO OBSERVER
    // ====================================================================

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    if (video.tagName === 'VIDEO' && video.paused) {
                        const p = video.play();
                        if (p !== undefined) p.catch(() => { });
                    }
                } else {
                    if (video.tagName === 'VIDEO' && !video.paused) {
                        video.pause();
                    }
                }
            });
        }, { threshold: 0.1 });

        const observeVideos = () => {
            galleryTrack.querySelectorAll('video').forEach(video => {
                if (!video.dataset.observed) {
                    videoObserver.observe(video);
                    video.dataset.observed = 'true';
                }
            });
        };
        observeVideos();
        setTimeout(observeVideos, 500);
    }

    // ====================================================================
    // LAYOUT METRICS (Dynamic Mobile Centering)
    // ====================================================================

    function updateLayoutMetrics() {
        if (window.innerWidth > 768) {
            document.documentElement.style.removeProperty('--mobile-info-height');
            return;
        }

        const infoBottom = document.getElementById('project-info-bottom');
        if (infoBottom) {
            const height = infoBottom.offsetHeight;
            document.documentElement.style.setProperty('--mobile-info-height', `${height}px`);
        }
    }

    window.addEventListener('resize', updateLayoutMetrics);
    // Initial call
    updateLayoutMetrics();

    // ====================================================================
    // INITIALIZE GALLERY
    // ====================================================================

    goToSlide(0, false);
});
