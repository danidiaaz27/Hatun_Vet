const API_URL = '/clientes/api';

let modalCliente = null;
let modalHistorial = null;
let dataTable = null;

$(document).ready(function() {
    modalCliente = new bootstrap.Modal(
        document.getElementById('modalCliente')
    );

    modalHistorial = new bootstrap.Modal(
        document.getElementById('modalHistorial')
    );

    inicializarTablaClientes();
    iniciarValidacionesCliente();
    iniciarFormularioClientes();
    iniciarAccionesClientes();
    iniciarHistorialClientes();
});