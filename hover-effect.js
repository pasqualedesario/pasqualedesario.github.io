// Funzione per mescolare le lettere di una parola
function shuffleWord(word) {
    let array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

// Funzione per mescolare ogni parola separatamente in un testo
function shuffleText(text) {
    return text.split(' ').map(shuffleWord).join(' ');
}

// Applica l'effetto a tutti gli elementi con classe 'hover-effect'
document.querySelectorAll('.hover-effect').forEach((element) => {
    const originalText = element.innerText; // Memorizza il testo originale

    element.addEventListener('mouseenter', () => {
        element.innerText = shuffleText(originalText);
    });

    element.addEventListener('mouseleave', () => {
        element.innerText = originalText;
    });
});