const API_URL = '/banos-cortes/api';
const MASCOTAS_API_URL = '/mascotas/api';

let modalServicio = null;
let mascotaSeleccionada = null;

let todosLosServicios = [];
let serviciosFiltrados = [];
let paginaActual = 1;

const POR_PAGINA = 6;

$(document).ready(function () {
    modalServicio = new bootstrap.Modal(document.getElementById('modalServicio'));

    cargarServicios();
    iniciarPaginacionYFiltro();
    iniciarCambioEstado();
    iniciarCancelarServicio();
    iniciarBusquedaMascotas();
    iniciarCatalogoServicios();
    iniciarNuevoServicio();
    iniciarGuardarServicio();
});