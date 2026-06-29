const API_URL = '/inventario/api';

let dataTable = null;

let modalIngreso = null;
let modalSalida = null;
let modalKardex = null;

$(document).ready(function () {

    modalIngreso = new bootstrap.Modal(
        document.getElementById('modalIngreso')
    );

    modalSalida = new bootstrap.Modal(
        document.getElementById('modalSalida')
    );

    modalKardex = new bootstrap.Modal(
        document.getElementById('modalKardex')
    );

    inicializarTablaInventario();
    iniciarMovimientosInventario();
    iniciarKardexInventario();
});