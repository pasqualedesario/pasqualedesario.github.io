/**
 * Design and development by Pasquale de Sario, 2026
 * Optimized: Wrapped in IIFE to avoid global scope pollution.
 */

(function () {
    'use strict';

    // ========================================================================
    // CONFIGURATION & STATE
    // ========================================================================

    const CONFIG = {
        weatherApiUrl: 'https://api.open-meteo.com/v1/forecast?latitude=41.1171&longitude=16.8719&current_weather=true',
        updateIntervals: {
            time: 1000,
            weather: 600000 // 10 minutes
        }
    };

    const state = {
        currentTemperature: null,
        currentLang: 'it',
        isChangingLanguage: false,
        gallery: {
            slides: [],
            shuffledProjects: [],
            currentSlide: 0,
            isTransitioning: false
        }
    };

    // ========================================================================
    // DATA: TRANSLATIONS & METADATA
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

    // ========================================================================
    // UTILS
    // ========================================================================

    const formatTime = (unit) => String(unit).padStart(2, '0');

    const stripHtml = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    // ========================================================================
    // FOOTER LOGIC
    // ========================================================================

    function buildFooterDateTimeHtml(now) {
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        const dateParts = {
            day: now.getDate(),
            month: months[now.getMonth()],
            year: now.getFullYear(),
            hours: formatTime(now.getHours()),
            minutes: formatTime(now.getMinutes()),
            seconds: formatTime(now.getSeconds()),
            timezone: Intl.DateTimeFormat('en', { timeZoneName: 'short' })
                .formatToParts(now)
                .find(part => part.type === 'timeZoneName')?.value.toLowerCase() || 'utc'
        };

        let html = `bari, <span class="num">${dateParts.day}</span> ${dateParts.month} <span class="num">${dateParts.year}</span>, <span class="num">${dateParts.hours}</span>:<span class="num">${dateParts.minutes}</span>:<span class="num">${dateParts.seconds}</span> ${dateParts.timezone}`;

        if (state.currentTemperature !== null) {
            html += `, <span class="num">${state.currentTemperature}</span><span class="grado-basso">°</span>c`;
        } else {
            html += `, <span class="num">--</span><span class="grado-basso">°</span>c`;
        }
        return html;
    }

    async function fetchTemperature() {
        try {
            const response = await fetch(CONFIG.weatherApiUrl);
            const data = await response.json();
            if (data.current_weather?.temperature !== undefined) {
                state.currentTemperature = Math.round(data.current_weather.temperature);
                updateFooterDateTimeCached(); // Update immediately
            }
        } catch (error) {
            console.error('Error fetching temperature:', error);
        }
    }

    function updateFooterDateTimeCached() {
        const footerDateTimeElements = document.querySelectorAll('.footer-datetime');
        if (footerDateTimeElements.length > 0) {
            const now = new Date();
            const dateTimeString = buildFooterDateTimeHtml(now);
            footerDateTimeElements.forEach(el => el.innerHTML = dateTimeString);
        }
    }

    function wrapFooterDashes() {
        document.querySelectorAll('.footer-marquee-text').forEach((el) => {
            if (!el.innerHTML.includes('<span class="emdash">')) {
                el.innerHTML = el.innerHTML.replace(/—/g, '<span class="emdash">—</span>');
            }
        });
    }

    // ========================================================================
    // LANGUAGE LOGIC
    // ========================================================================

    function setLanguage(lang) {
        if (state.currentLang === lang) return;
        if (state.isChangingLanguage) return;

        state.isChangingLanguage = true;
        state.currentLang = lang;

        // Update URL hash without scrolling
        const newHash = lang === 'it' ? '#it' : '#en';
        if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
        }

        // Update HTML lang attribute
        const htmlRoot = document.getElementById('html-root');
        if (htmlRoot) htmlRoot.setAttribute('lang', lang);

        // Update Text Content
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[lang]?.[key]) {
                element.innerHTML = translations[lang][key];
            }
        });

        // Update Gallery Metadata if active
        if (state.gallery.slides.length > 0) {
            updateProjectMetadata(lang);
        }

        state.isChangingLanguage = false;
    }

    function updateProjectMetadata(lang) {
        // Update DOM metadata
        document.querySelectorAll('#project-data .project-entry').forEach(entry => {
            const projectId = entry.getAttribute('data-project-id');
            if (!projectId) return;

            const metadata = projectMetadata[lang]?.[projectId];
            if (metadata) {
                if (metadata.category) entry.setAttribute('data-category', metadata.category);
                if (metadata.year) entry.setAttribute('data-year', metadata.year);
            }
        });

        // Update runtime gallery slides
        let slideIdx = 0;
        state.gallery.shuffledProjects.forEach(entry => {
            const category = entry.getAttribute('data-category') || '';
            const year = entry.getAttribute('data-year') || '';
            const imagesAttr = entry.getAttribute('data-images') || '';
            // Determine how many slides this project generated
            const count = imagesAttr.split('|').map(s => s.trim()).filter(Boolean).length;

            for (let i = 0; i < count; i++) {
                if (slideIdx < state.gallery.slides.length) {
                    state.gallery.slides[slideIdx].category = category;
                    state.gallery.slides[slideIdx].year = year;
                }
                slideIdx++;
            }
        });

        updateProjectInfoDisplay();
    }

    function initializeLanguage() {
        const hash = window.location.hash.substring(1);
        if (hash === 'en') {
            state.currentLang = 'it'; // force update
            setLanguage('en');
        } else {
            state.currentLang = 'en'; // force update
            setLanguage('it');
        }
    }

    // ========================================================================
    // GALLERY LOGIC
    // ========================================================================

    function initGallery() {
        const galleryTrack = document.getElementById('gallery-track');
        if (!galleryTrack) return;

        // Shuffle Projects
        const projectEntries = Array.from(document.querySelectorAll('#project-data .project-entry'));
        state.gallery.shuffledProjects = (function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        })([...projectEntries]);

        // Build Slides
        const thumbnailTrack = document.getElementById('thumbnail-track');

        state.gallery.shuffledProjects.forEach(entry => {
            const projectId = entry.getAttribute('data-project-id');
            const title = entry.getAttribute('data-title') || '';
            const category = entry.getAttribute('data-category') || '';
            const year = entry.getAttribute('data-year') || '';
            const sources = (entry.getAttribute('data-images') || '').split('|').map(s => s.trim()).filter(Boolean);

            sources.forEach((src, index) => {
                state.gallery.slides.push({ src, projectId, title, category, year });
                createSlideElement(galleryTrack, src, title, index);
                createThumbnailElement(thumbnailTrack, src, index);
            });
        });

        setupGalleryInteraction();
        goToSlide(0, false);
    }

    function createSlideElement(container, src, title, index) {
        const slideEl = document.createElement('div');
        slideEl.className = 'gallery-slide';

        const ext = src.split('.').pop().toLowerCase();
        const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

        if (isVideo) {
            const video = document.createElement('video');
            Object.assign(video, {
                autoplay: true, muted: true, playsInline: true, loop: true, preload: 'auto', draggable: false
            });
            video.setAttribute('webkit-playsinline', '');

            const source = document.createElement('source');
            source.src = src;
            source.type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
            video.appendChild(source);

            // Prevent interference
            ['contextmenu', 'dragstart', 'click'].forEach(evt => video.addEventListener(evt, e => e.preventDefault()));
            Object.assign(video.style, { userSelect: 'none', pointerEvents: 'none' });

            // Robust play attempt
            const tryPlay = () => { if (video.paused) video.play().catch(() => { }); };
            ['loadedmetadata', 'canplay'].forEach(evt => video.addEventListener(evt, tryPlay));

            slideEl.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = src;
            const plainTitle = stripHtml(title).trim();
            img.alt = plainTitle ? `${plainTitle} — image ${index + 1}` : `project image ${index + 1}`;
            img.decoding = 'async';
            img.loading = index < 3 ? 'eager' : 'lazy';
            img.draggable = false;

            ['contextmenu', 'dragstart'].forEach(evt => img.addEventListener(evt, e => e.preventDefault()));
            Object.assign(img.style, { userSelect: 'none', pointerEvents: 'none' });

            slideEl.appendChild(img);
        }
        container.appendChild(slideEl);
    }

    function createThumbnailElement(container, src, index) {
        const thumbEl = document.createElement('div');
        thumbEl.className = 'thumbnail-item';
        thumbEl.dataset.index = index;

        const isVideo = ['mp4', 'webm', 'mov', 'ogg'].some(ext => src.toLowerCase().endsWith(ext));
        const media = document.createElement(isVideo ? 'video' : 'img');
        media.src = src;
        media.draggable = false;

        if (isVideo) {
            media.muted = true;
            media.preload = 'metadata';
            media.playsInline = true;
        } else {
            media.loading = 'lazy';
            media.decoding = 'async';
        }

        media.addEventListener('contextmenu', e => e.preventDefault());
        thumbEl.appendChild(media);
        thumbEl.addEventListener('click', () => goToSlide(index));

        container.appendChild(thumbEl);
    }

    function goToSlide(index, animate = true) {
        const { slides, currentSlide, isTransitioning } = state.gallery;
        if (index < 0 || index >= slides.length || (isTransitioning && animate)) return;

        state.gallery.isTransitioning = true;
        state.gallery.currentSlide = index;

        const galleryTrack = document.getElementById('gallery-track');
        const offset = -100 * index;

        if (!animate) {
            galleryTrack.style.transition = 'none';
            galleryTrack.style.transform = `translateX(${offset}vw)`;
            // Force reflow
            void galleryTrack.offsetWidth;
            galleryTrack.style.transition = 'transform 0.6s ease';
        } else {
            galleryTrack.style.transition = 'transform 0.6s ease';
            galleryTrack.style.transform = `translateX(${offset}vw)`;
        }

        updateProjectInfoDisplay();
        updateActiveThumbnail();
        scrollThumbnailIntoView();

        // Play active video if needed
        setTimeout(() => {
            const activeSlide = galleryTrack.children[index];
            const video = activeSlide?.querySelector('video');
            if (video && video.paused) video.play().catch(() => { });
            state.gallery.isTransitioning = false;
        }, animate ? 600 : 50);
    }

    function updateProjectInfoDisplay() {
        const slide = state.gallery.slides[state.gallery.currentSlide];
        if (!slide) return;

        const titleEl = document.getElementById('project-title-bottom');
        const detailEl = document.getElementById('project-detail-bottom');

        if (titleEl) titleEl.innerHTML = slide.title;
        if (detailEl) {
            detailEl.innerHTML = (slide.category || '') +
                (slide.category && slide.year ? '<br>' : '') +
                (slide.year || '');
        }
        requestAnimationFrame(updateLayoutMetrics);
    }

    function updateActiveThumbnail() {
        document.querySelectorAll('.thumbnail-item').forEach((t, i) => {
            t.classList.toggle('active', i === state.gallery.currentSlide);
        });
    }

    function scrollThumbnailIntoView() {
        const thumbnailTrack = document.getElementById('thumbnail-track');
        const activeThumb = thumbnailTrack?.children[state.gallery.currentSlide];
        if (!activeThumb) return;

        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const trackWidth = thumbnailTrack.clientWidth;

        thumbnailTrack.scrollLeft = thumbLeft - (trackWidth / 2) + (thumbWidth / 2);
    }

    function setupGalleryInteraction() {
        const container = document.getElementById('gallery-container');
        if (!container) return;

        // Click nav
        container.addEventListener('click', (e) => {
            if (e.target.closest('#project-info-bottom')) return;
            const direction = e.clientX < window.innerWidth / 2 ? -1 : 1;
            changeSlide(direction);
        });

        // Keyboard nav
        window.addEventListener('keydown', (e) => {
            if (e.defaultPrevented) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); changeSlide(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); changeSlide(-1); }
        });

        // Swipe nav
        let touchStartX = 0;
        let touchStartY = 0;
        let isHorizontalSwipe = false;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isHorizontalSwipe = false;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
            const deltaY = Math.abs(e.touches[0].clientY - touchStartY);

            // Lock direction once
            if (!isHorizontalSwipe && deltaX > deltaY && deltaX > 10) {
                isHorizontalSwipe = true;
            }

            if (isHorizontalSwipe) e.preventDefault();
        }, { passive: false });

        container.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (isHorizontalSwipe && Math.abs(deltaX) > 40) {
                changeSlide(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });

        // Wheel nav
        let wheelTimeout;
        container.addEventListener('wheel', (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (Math.abs(delta) < 10 || wheelTimeout) return;

            e.preventDefault();
            changeSlide(delta > 0 ? 1 : -1);

            wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 600);
        }, { passive: false });
    }

    function changeSlide(direction) {
        goToSlide(state.gallery.currentSlide + direction);
    }

    function updateLayoutMetrics() {
        if (window.innerWidth > 768) {
            document.documentElement.style.removeProperty('--mobile-info-height');
            return;
        }
        const infoBottom = document.getElementById('project-info-bottom');
        if (infoBottom) {
            document.documentElement.style.setProperty('--mobile-info-height', `${infoBottom.offsetHeight}px`);
        }
    }

    // ========================================================================
    // VIDEO OBSERVER
    // ========================================================================

    function initVideoObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting && video.paused) video.play().catch(() => { });
                else if (!entry.isIntersecting && !video.paused) video.pause();
            });
        }, { threshold: 0.1 });

        const track = document.getElementById('gallery-track');
        if (track) {
            setTimeout(() => {
                track.querySelectorAll('video').forEach(v => {
                    if (!v.dataset.observed) {
                        observer.observe(v);
                        v.dataset.observed = 'true';
                    }
                });
            }, 500);
        }
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    document.addEventListener('DOMContentLoaded', () => {
        // Footer init
        updateFooterDateTimeCached();
        setInterval(updateFooterDateTimeCached, CONFIG.updateIntervals.time);

        fetchTemperature();
        setInterval(fetchTemperature, CONFIG.updateIntervals.weather);

        wrapFooterDashes();

        // Language init
        document.querySelectorAll('.lang-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang-code');
                if (lang) setLanguage(lang);
            });
        });

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if ((hash === 'en' && state.currentLang !== 'en') ||
                ((hash === 'it' || hash === '') && state.currentLang !== 'it')) {
                setLanguage(hash === 'en' ? 'en' : 'it');
            }
        });

        initializeLanguage();

        // Gallery init
        initGallery();
        initVideoObserver();

        // Layout metrics
        window.addEventListener('resize', updateLayoutMetrics);
        updateLayoutMetrics();
    });

})();
