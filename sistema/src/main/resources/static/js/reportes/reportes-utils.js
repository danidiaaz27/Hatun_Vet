function crearFormatoMoneda() {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    });
}

function inicializarFechaActual() {
    const opcionesFecha = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    $('#fechaActual').text(
        new Date().toLocaleDateString('es-PE', opcionesFecha)
    );
}

function formatearMoneda(valor) {
    return formatoMoneda.format(valor);
}

function mostrarError(mensaje) {
    console.error(mensaje);
    alert(mensaje);
}