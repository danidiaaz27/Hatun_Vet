const API_URL = '/mascotas/api';
const CLIENTES_API_URL = '/clientes/api';

let modalMascota = null;
let dt = null;

let mascotasCache = [];
let clientesCache = [];
let filtroActual = '';

$(document).ready(function () {

    modalMascota = new bootstrap.Modal(
        document.getElementById('modalMascota')
    );

    inicializarTablaMascotas();
    iniciarBusquedaMascotas();
    iniciarAccionesMascotas();

    cargarClientesSeleccion();
    cargarMascotas(`${API_URL}/listar`, 'Listado general');
});