function iniciarScrollLanding() {
    iniciarSombraNavbar();
    iniciarScrollSuaveLinks();
}

function iniciarSombraNavbar() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');

        if (!header) return;

        header.style.boxShadow =
            window.scrollY > 50
                ? '0 4px 20px rgba(0,0,0,0.15)'
                : '0 2px 10px rgba(0,0,0,0.1)';
    });
}

function iniciarScrollSuaveLinks() {
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (!targetSection) return;

            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });
}