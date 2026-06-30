const API_BASE = '/productos/api';

let dataTable = null;
let productoModal = null;

$(document).ready(function () {

    productoModal = new bootstrap.Modal(
        document.getElementById('productoModal')
    );

    cargarCategorias();
    cargarProveedores();

    inicializarTablaProductos();

    iniciarFormularioProducto();

    iniciarEdicionProducto();

    iniciarAccionesProducto();

    iniciarEventosProducto();
});