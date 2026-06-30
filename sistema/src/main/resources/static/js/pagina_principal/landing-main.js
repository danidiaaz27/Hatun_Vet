document.addEventListener('DOMContentLoaded', function() {
    iniciarSwipersLanding();
    iniciarModalCita();
    iniciarScrollLanding();
    iniciarAnimacionesLanding();
    establecerFechaMinimaCita();
});

function establecerFechaMinimaCita() {
    const dateInput = document.querySelector('input[type="date"]');

    if (!dateInput) return;

    dateInput.min = new Date().toISOString().split('T')[0];
}