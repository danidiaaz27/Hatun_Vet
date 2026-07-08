const API_BASE = '/usuarios/api';

let dataTable = null;
let usuarioModal = null;

$(document).ready(function() {
    usuarioModal = new bootstrap.Modal(
        document.getElementById('usuarioModal')
    );

    inicializarTablaUsuarios();
    cargarPerfiles();
    iniciarToggleClave();
    iniciarValidacionesUsuario();
    iniciarFormularioUsuarios();
    iniciarAccionesUsuarios();
    iniciarCambioClaveUsuario();
});