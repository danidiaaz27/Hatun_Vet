function iniciarAnimacionesLanding() {
    const cards = document.querySelectorAll(
        '.service-card, .promo-card, .mission-card, .stat-card, .landing-card'
    );

    if (cards.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) mostrarCardAnimada(entry.target);
        });
    }, {
        threshold: 0.2
    });

    cards.forEach(card => prepararCardAnimada(card, observer));
}

function prepararCardAnimada(card, observer) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = 'all 0.7s ease';

    observer.observe(card);
}

function mostrarCardAnimada(card) {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
}