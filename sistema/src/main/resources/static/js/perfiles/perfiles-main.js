const API_BASE = '/perfiles/api';

let perfilModal = null;
let permisosModal = null;
let dataTable = null;

$(document).ready(function() {
    perfilModal = new bootstrap.Modal(
        document.getElementById('perfilModal')
    );

    permisosModal = new bootstrap.Modal(
        document.getElementById('permisosModal')
    );

    inicializarTablaPerfiles();
    iniciarFormularioPerfiles();
    iniciarEdicionPerfiles();
    iniciarPermisosPerfiles();
    iniciarEliminacionPerfiles();
});