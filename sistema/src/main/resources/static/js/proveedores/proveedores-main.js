const API_BASE = '/proveedores/api';

let dataTable = null;
let proveedorModal = null;

$(document).ready(function () {

    proveedorModal = new bootstrap.Modal(
        document.getElementById('proveedorModal')
    );

    inicializarTablaProveedores();

    iniciarValidacionesProveedor();

    iniciarBusquedaRuc();

    iniciarFormularioProveedor();

    iniciarEdicionProveedor();

    iniciarAccionesProveedor();
});