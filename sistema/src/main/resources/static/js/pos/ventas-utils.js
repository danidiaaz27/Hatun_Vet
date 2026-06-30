function iniciarRelojPOS() {
    setInterval(() => {
        $('#relojActual').text(new Date().toLocaleTimeString('es-PE'));
    }, 1000);
}

function resetearDatosCliente() {
    $('#numDoc, #nombreCliente').val('');
    $('#tipoDoc').val('1').trigger('change');
    $('#metodoPago').val('efectivo');
}

function mostrarSpinnerBoton(btn, texto) {
    btn.prop('disabled', true).html(
        `<span class="spinner-border spinner-border-sm me-2"></span> ${texto}`
    );
}

function restaurarBoton(btn, html) {
    btn.prop('disabled', false).html(html);
}

function obtenerTotalCarrito() {
    return carrito.reduce(
        (total, item) => total + item.precio * item.cantidad,
        0
    );
}