const API_BASE = '/configuracion/api';

let landingModal = null;

$(document).ready(function() {
    landingModal = new bootstrap.Modal(
        document.getElementById('landingImagenModal')
    );

    iniciarFormularioConfiguracion();
    iniciarFormularioImagenes();
    iniciarAccionesImagenes();

    cargarConfiguracion();
    cargarImagenes();
});