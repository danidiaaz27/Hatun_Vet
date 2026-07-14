let modalNuevaCita = null;
let modalCheckIn = null;
let clientesList = [];
let slotSeleccionado = null;

document.addEventListener('DOMContentLoaded', function() {
    modalNuevaCita = new bootstrap.Modal(document.getElementById('modalNuevaCita'));
    modalCheckIn = new bootstrap.Modal(document.getElementById('modalCheckIn'));

    iniciarCalendario();
    cargarMedicos();
    cargarClientes();
    iniciarAutocomplete();
    iniciarRegistroRapido();
    iniciarSlots();
    iniciarFormularioNuevaCita();
    iniciarCheckIn();
    iniciarUtilidadesAgenda();
});