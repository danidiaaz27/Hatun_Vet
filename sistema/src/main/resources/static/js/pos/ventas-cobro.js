function iniciarCobroPOS() {
    $('#btnCobrar').click(procesarVentaPOS);
}

function procesarVentaPOS() {
    if (carrito.length === 0) {
        Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');
        return;
    }

    if (!validarDatosCobro()) return;

    const btn = $('#btnCobrar');
    mostrarSpinnerBoton(btn, 'Procesando...');

    fetch('/ventas/api/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadVenta())
    })
        .then(r => r.json())
        .then(manejarRespuestaVenta)
        .catch(() =>
            Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error')
        )
        .finally(() =>
            restaurarBoton(btn, '<i class="bi bi-receipt me-2"></i> FINALIZAR VENTA')
        );
}

function validarDatosCobro() {
    const tipoDoc = $('#tipoDoc').val();
    const numDoc = $('#numDoc').val().trim();
    const nombre = $('#nombreCliente').val().trim();

    if (tipoDoc === '1' && numDoc.length !== 8) {
        Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
        return false;
    }

    if (tipoDoc === '6' && numDoc.length !== 11) {
        Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
        return false;
    }

    if (!nombre) {
        Swal.fire('Cliente requerido', 'Ingresa el nombre del cliente.', 'warning');
        return false;
    }

    return true;
}
function crearPayloadVenta() {
    return {
        citaId: importCitaId,
        banoCorteId: importBanoCorteId,
        abonoGrooming: calcularAbonoGrooming(),
        abonoCita: calcularAbonoCita(),
        cliente: crearClienteVenta(),
        comprobante: crearComprobanteVenta(),
        items: carrito.map(crearItemApiVenta)
    };
}

function crearClienteVenta() {
    return {
        codigoPais: 'PE',
        tipoDoc: $('#tipoDoc').val(),
        numDoc: $('#numDoc').val().trim(),
        rznSocial: $('#nombreCliente').val().trim(),
        direccion: '-'
    };
}

function crearComprobanteVenta() {
    const metodo = $('#metodoPago').val() || 'efectivo';

    return {
        tipoOperacion: '0101',
        tipoDoc: $('#tipoDoc').val() === '6' ? '01' : '03',
        tipoMoneda: 'PEN',
        tipoPago: metodo === 'yape' ? 'Yape' : 'Contado',
        observacion: 'Generado desde POS HatunVet'
    };
}

function crearItemApiVenta(item) {
    const valorUnit = item.precio / (1 + TASA_IGV);
    const base = valorUnit * item.cantidad;
    const igvItem = (item.precio * item.cantidad) - base;

    return {
        codProducto: item.codigo,
        descripcion: item.nombre,
        unidad: 'NIU',
        cantidad: item.cantidad,
        mtoBaseIgv: parseFloat(base.toFixed(2)),
        mtoValorUnitario: parseFloat(valorUnit.toFixed(2)),
        mtoPrecioUnitario: parseFloat(item.precio.toFixed(2)),
        codeAfect: '10',
        igvPorcent: 18,
        igv: parseFloat(igvItem.toFixed(2))
    };
}

function calcularAbonoGrooming() {
    let total = 0;

    carrito.forEach(item => {
        if (item.isGroomingImported && item.banoCorteId === importBanoCorteId) {
            total += item.precio * item.cantidad;
        }
    });

    return parseFloat(total.toFixed(2));
}

function calcularAbonoCita() {
    let total = 0;

    carrito.forEach(item => {
        if (item.isCitaImported && item.citaId === importCitaId) {
            total += item.precio * item.cantidad;
        }
    });

    return parseFloat(total.toFixed(2));
}

function manejarRespuestaVenta(data) {
    if (data.success && data.miapicloud?.respuesta?.success) {
        mostrarVentaExitosa(data.miapicloud.respuesta);
        return;
    }

    Swal.fire(
        'Error',
        data.message || 'La API o SUNAT rechazó el comprobante.',
        'error'
    );
}

function mostrarVentaExitosa(res) {
    const esOffline = res['pdf-ticket'] === '#';

    Swal.fire({
        title: esOffline ? '¡Guardado Local Exitoso!' : '¡Venta Realizada!',
        text: esOffline
            ? 'La venta se guardó de forma local.'
            : 'Comprobante emitido correctamente.',
        icon: esOffline ? 'info' : 'success',
        showCancelButton: !esOffline,
        confirmButtonText: esOffline ? 'Entendido' : '<i class="bi bi-printer"></i> Ticket',
        cancelButtonText: '<i class="bi bi-file-earmark-pdf"></i> A4',
        confirmButtonColor: '#0A3D91',
        cancelButtonColor: '#D32F2F',
        allowOutsideClick: false
    }).then(choice => finalizarRespuestaVenta(choice, res, esOffline));
}

function finalizarRespuestaVenta(choice, res, esOffline) {
    if (!esOffline) {
        if (choice.isConfirmed) window.open(res['pdf-ticket'], '_blank');
        else if (choice.dismiss === Swal.DismissReason.cancel) {
            window.open(res['pdf-a4'], '_blank');
        }
    }

    resetearPOSVenta();
}