let carrito = [];
let importCitaId = null;
let importBanoCorteId = null;
let promocionesActivas = [];

const TASA_IGV = 0.18;

let modalCitasCobro = null;
let modalGroomingCobro = null;

$(document).ready(function() {
    modalCitasCobro = new bootstrap.Modal(
        document.getElementById('modalCitasCobro')
    );

    modalGroomingCobro = new bootstrap.Modal(
        document.getElementById('modalGroomingCobro')
    );

    cargarPromocionesActivas();
    iniciarRelojPOS();
    iniciarClientePOS();
    iniciarBuscadorProductos();
    iniciarCarritoPOS();
    iniciarCobroPOS();

    renderizarCarrito();
});