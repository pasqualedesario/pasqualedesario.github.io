document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const container = document.querySelector('.carousel-container');
    const images = Array.from(carousel.querySelectorAll('.carousel-image'));
    let currentPosition = 0;
    let isTransitioning = false;
    
    // Funzione per mischiare un array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Randomizza l'ordine delle immagini
    const shuffledImages = shuffleArray([...images]);
    carousel.innerHTML = '';
    
    // Aggiungi copie delle ultime due immagini all'inizio
    const lastTwo = shuffledImages.slice(-2);
    lastTwo.forEach(img => {
        const clone = img.cloneNode(true);
        clone.setAttribute('data-clone', 'start');
        carousel.appendChild(clone);
    });
    
    // Aggiungi le immagini originali
    shuffledImages.forEach(img => carousel.appendChild(img));
    
    // Aggiungi copie delle prime due immagini alla fine
    const firstTwo = shuffledImages.slice(0, 2);
    firstTwo.forEach(img => {
        const clone = img.cloneNode(true);
        clone.setAttribute('data-clone', 'end');
        carousel.appendChild(clone);
    });

        async function updateImageSizes() {
        const containerHeight = container.offsetHeight;
        let accumulatedWidth = 0;
        
        // Aspetta che tutte le immagini siano caricate
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
            });
        }));
        
        // Calcola le dimensioni basandosi sulle dimensioni naturali delle immagini
        images.forEach(img => {
            // Se l'immagine non ha dimensioni naturali, usa un rapporto predefinito
            const naturalRatio = (img.naturalWidth && img.naturalHeight) 
                ? img.naturalWidth / img.naturalHeight 
                : 16/9;
            
            const imageWidth = containerHeight * naturalRatio;
            img.style.width = `${imageWidth}px`;
            img.style.height = '100%';
            accumulatedWidth += imageWidth;
        });

        // Imposta la larghezza minima del carousel alla somma delle larghezze delle immagini
        carousel.style.minWidth = `${accumulatedWidth}px`;
        
        // Log per debug
        console.log('Dimensioni aggiornate:', {
            containerHeight,
            accumulatedWidth,
            imagesCount: images.length,
            carouselWidth: carousel.offsetWidth,
            containerWidth: container.offsetWidth
        });

        return accumulatedWidth;
    }

    // Funzione per il movimento del carosello
    function moveCarousel(direction) {
        if (isTransitioning) return;
        
        const containerWidth = container.offsetWidth;
        const carouselWidth = carousel.offsetWidth;
        const moveAmount = containerWidth * 0.8;
        const realImagesCount = images.length; // numero di immagini originali
        const singleImageWidth = carouselWidth / (realImagesCount + 4); // +4 per i cloni
        
        if (direction === 'left') {
            currentPosition += moveAmount;
            
            // Se siamo arrivati all'inizio dei cloni
            if (currentPosition > -singleImageWidth) {
                // Disattiva la transizione
                isTransitioning = true;
                carousel.style.transition = 'none';
                // Sposta al punto corrispondente con le immagini reali
                currentPosition = -((realImagesCount) * singleImageWidth);
                carousel.style.transform = `translateX(${currentPosition}px)`;
                
                // Riattiva la transizione nel prossimo frame
                requestAnimationFrame(() => {
                    carousel.style.transition = '';
                    currentPosition += moveAmount;
                    carousel.style.transform = `translateX(${currentPosition}px)`;
                    isTransitioning = false;
                });
                return;
            }
        } else {
            currentPosition -= moveAmount;
            
            // Se siamo arrivati alla fine dei cloni
            if (-currentPosition > (realImagesCount + 1) * singleImageWidth) {
                // Disattiva la transizione
                isTransitioning = true;
                carousel.style.transition = 'none';
                // Sposta al punto corrispondente con le immagini reali
                currentPosition = -singleImageWidth;
                carousel.style.transform = `translateX(${currentPosition}px)`;
                
                // Riattiva la transizione nel prossimo frame
                requestAnimationFrame(() => {
                    carousel.style.transition = '';
                    currentPosition -= moveAmount;
                    carousel.style.transform = `translateX(${currentPosition}px)`;
                    isTransitioning = false;
                });
                return;
            }
        }

        // Movimento normale
        requestAnimationFrame(() => {
            carousel.style.transform = `translateX(${currentPosition}px)`;
        });
    }

    // Inizializzazione
    async function initCarousel() {
        try {
            await updateImageSizes();
            // Posiziona il carosello all'inizio delle immagini reali (dopo i cloni)
            const singleImageWidth = carousel.offsetWidth / (images.length + 4);
            currentPosition = -singleImageWidth * 2;
            carousel.style.transition = 'none';
            carousel.style.transform = `translateX(${currentPosition}px)`;
            
            // Forza un reflow e riattiva la transizione
            carousel.offsetHeight;
            carousel.style.transition = '';
            
            console.log('Carosello inizializzato:', {
                carouselWidth: carousel.offsetWidth,
                containerWidth: container.offsetWidth,
                imagesCount: images.length,
                singleImageWidth,
                initialPosition: currentPosition
            });
        } catch (error) {
            console.error('Errore nell\'inizializzazione del carosello:', error);
        }
    }

    // Avvia l'inizializzazione
    initCarousel();

    // Gestione del cursore
    container.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const width = window.innerWidth;
        
        if (x < width / 2) {
            container.classList.remove('cursor-right');
            container.classList.add('cursor-left');
        } else {
            container.classList.remove('cursor-left');
            container.classList.add('cursor-right');
        }
    });

    // Click per navigazione
    container.addEventListener('click', (e) => {
        const x = e.clientX;
        const width = window.innerWidth;
        
        if (x < width / 2) {
            moveCarousel('left');
        } else {
            moveCarousel('right');
        }
    });

    // Navigazione con tastiera
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moveCarousel('left');
        } else if (e.key === 'ArrowRight') {
            moveCarousel('right');
        }
    });

    // Gestione del touch
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            moveCarousel(diff > 0 ? 'right' : 'left');
        }
    });

    // Gestione del ridimensionamento
    window.addEventListener('resize', () => {
        updateImageSizes();
        // Assicurati che la posizione corrente sia ancora valida
        const maxScroll = -(carousel.offsetWidth - container.offsetWidth);
        currentPosition = Math.max(maxScroll, Math.min(0, currentPosition));
        carousel.style.transform = `translateX(${currentPosition}px)`;
    });
});
