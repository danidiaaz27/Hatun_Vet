function calcularTotales() {
    let total = 0;
    let gravadas = 0;
    let igv = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const valorUnit = item.precio / (1 + TASA_IGV);
        const base = valorUnit * item.cantidad;

        total += subtotal;
        gravadas += base;
        igv += subtotal - base;
    });

    $('#lblOpGravadas').text(gravadas.toFixed(2));
    $('#lblIgv').text(igv.toFixed(2));
    $('#lblTotal').text(total.toFixed(2));
}

function resetearPOSVenta() {
    carrito = [];
    importCitaId = null;
    importBanoCorteId = null;

    resetearDatosCliente();
    renderizarCarrito();
}