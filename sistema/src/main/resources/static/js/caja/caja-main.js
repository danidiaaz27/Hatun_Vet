const API_URL = '/caja/api';

let modalMovimiento = null;
let modalCierre = null;
let tablaCaja = null;

let usuarioActivo = 'Administrador';
let montoAperturaSesion = 0.00;

$(document).ready(function() {
    modalMovimiento = new bootstrap.Modal(
        document.getElementById('modalMovimiento')
    );

    modalCierre = new bootstrap.Modal(
        document.getElementById('modalCierre')
    );

    inicializarTablaCaja();
    iniciarFiltrosCaja();
    iniciarOperacionesCaja();

    verificarEstadoCaja();
});