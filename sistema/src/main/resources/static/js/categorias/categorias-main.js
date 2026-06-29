const API_BASE = '/categorias/api';

let dataTable = null;
let categoriaModal = null;

$(document).ready(function() {
    categoriaModal = new bootstrap.Modal(
        document.getElementById('categoriaModal')
    );

    inicializarTablaCategorias();
    iniciarFormularioCategorias();
    iniciarAccionesCategorias();
});