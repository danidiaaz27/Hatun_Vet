// ==============================
// SWIPER PROMOCIONES
// ==============================

if (document.querySelector(".promocionesSwiper")) {
    new Swiper(".promocionesSwiper", {
        loop: true,
        spaceBetween: 30,

        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },

        pagination: {
            el: ".promocionesSwiper .swiper-pagination",
            clickable: true,
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },

            768: {
                slidesPerView: 2
            },

            1024: {
                slidesPerView: 3
            }
        }
    });
}

if (document.querySelector(".landingSwiper")) {
    new Swiper(".landingSwiper", {
        loop: true,
        spaceBetween: 24,

        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },

        pagination: {
            el: ".landingSwiper .swiper-pagination",
            clickable: true,
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },

            768: {
                slidesPerView: 2
            },

            1100: {
                slidesPerView: 3
            }
        }
    });
}

// ==============================
// SWIPER SERVICIOS
// ==============================

if (document.querySelector(".serviciosSwiper")) {
    new Swiper(".serviciosSwiper", {
        loop: true,
        spaceBetween: 30,

        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },

        pagination: {
            el: ".serviciosSwiper .swiper-pagination",
            clickable: true,
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },

            768: {
                slidesPerView: 2
            },

            1024: {
                slidesPerView: 3
            }
        }
    });
}


// ==============================
// MODAL AGENDAR CITA
// ==============================

const modal = document.getElementById("appointmentModal");

const openModalBtn = document.getElementById("openModal");

const openModalHeroBtn = document.getElementById("openModalHero");

const closeModalBtn = document.getElementById("closeModal");


// Abrir modal desde header
if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}


// Abrir modal desde hero
if (openModalHeroBtn) {
    openModalHeroBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}


// Cerrar modal
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}


// Cerrar al hacer click fuera
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


// ==============================
// FORMULARIO
// ==============================

const appointmentForm = document.getElementById("appointmentForm");

if (appointmentForm) {
    appointmentForm.addEventListener("submit", (e) => {

        e.preventDefault();

        alert("✅ Cita agendada correctamente. Nos comunicaremos contigo pronto.");

        appointmentForm.reset();

        modal.style.display = "none";
    });
}


// ==============================
// ANIMACION NAVBAR SCROLL
// ==============================

window.addEventListener("scroll", () => {

    const header = document.querySelector(".header");

    if(window.scrollY > 50){
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
    }else{
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    }
});


// ==============================
// SCROLL SUAVE LINKS
// ==============================

const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const targetId = link.getAttribute("href");

        const targetSection = document.querySelector(targetId);

        if(targetSection){

            window.scrollTo({
                top: targetSection.offsetTop - 100,
                behavior: "smooth"
            });
        }
    });
});


// ==============================
// ANIMACION CARDS
// ==============================

const cards = document.querySelectorAll(
    ".service-card, .promo-card, .mission-card, .stat-card, .landing-card"
);

if (cards.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.style.opacity = "1";

                entry.target.style.transform = "translateY(0)";
            }
        });

    }, {
        threshold: 0.2
    });


    cards.forEach(card => {

        card.style.opacity = "0";

        card.style.transform = "translateY(40px)";

        card.style.transition = "all 0.7s ease";

        observer.observe(card);
    });
}


// ==============================
// FECHA MINIMA INPUT DATE
// ==============================

const dateInput = document.querySelector('input[type="date"]');

if(dateInput){

    const today = new Date().toISOString().split("T")[0];

    dateInput.min = today;
}