function iniciarSwipersLanding() {
    iniciarSwiperPromociones();
    iniciarSwiperLanding();
    iniciarSwiperServicios();
}

function iniciarSwiperPromociones() {
    if (!document.querySelector('.promocionesSwiper')) return;

    new Swiper('.promocionesSwiper', {
        loop: true,
        spaceBetween: 30,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.promocionesSwiper .swiper-pagination',
            clickable: true
        },
        breakpoints: obtenerBreakpointsTresColumnas()
    });
}

function iniciarSwiperLanding() {
    if (!document.querySelector('.landingSwiper')) return;

    new Swiper('.landingSwiper', {
        loop: true,
        spaceBetween: 24,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false
        },
        pagination: {
            el: '.landingSwiper .swiper-pagination',
            clickable: true
        },
        breakpoints: {
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1100: { slidesPerView: 3 }
        }
    });
}

function iniciarSwiperServicios() {
    if (!document.querySelector('.serviciosSwiper')) return;

    new Swiper('.serviciosSwiper', {
        loop: true,
        spaceBetween: 30,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.serviciosSwiper .swiper-pagination',
            clickable: true
        },
        breakpoints: obtenerBreakpointsTresColumnas()
    });
}

function obtenerBreakpointsTresColumnas() {
    return {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
    };
}