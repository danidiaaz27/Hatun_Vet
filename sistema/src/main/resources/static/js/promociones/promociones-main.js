const API_BASE = '/promociones/api';

let promocionModal = null;

$(document).ready(function() {
    promocionModal = new bootstrap.Modal(
        document.getElementById('promocionModal')
    );

    cargarCombos();
    iniciarVistaCardsPromociones();
    iniciarFormularioPromociones();
    iniciarAccionesPromociones();

    cargarPromociones();
});