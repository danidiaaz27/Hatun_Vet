const RUC_EMISOR = '20494100186';

let ventasData = [];
let dataTable = null;

$(document).ready(function() {
    inicializarTablaHistorial();
    iniciarDetalleVenta();
    iniciarFiltrosHistorial();
});