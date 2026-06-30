function iniciarModalCita() {
    const modal = document.getElementById('appointmentModal');
    const openModalBtn = document.getElementById('openModal');
    const openModalHeroBtn = document.getElementById('openModalHero');
    const closeModalBtn = document.getElementById('closeModal');
    const appointmentForm = document.getElementById('appointmentForm');

    if (!modal) return;

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => abrirModalCita(modal));
    }

    if (openModalHeroBtn) {
        openModalHeroBtn.addEventListener('click', () => abrirModalCita(modal));
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => cerrarModalCita(modal));
    }

    window.addEventListener('click', e => {
        if (e.target === modal) cerrarModalCita(modal);
    });

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', e =>
            enviarFormularioCita(e, appointmentForm, modal)
        );
    }
}

function abrirModalCita(modal) {
    modal.style.display = 'flex';
}

function cerrarModalCita(modal) {
    modal.style.display = 'none';
}

function enviarFormularioCita(e, form, modal) {
    e.preventDefault();

    alert('✅ Cita agendada correctamente. Nos comunicaremos contigo pronto.');

    form.reset();
    cerrarModalCita(modal);
}