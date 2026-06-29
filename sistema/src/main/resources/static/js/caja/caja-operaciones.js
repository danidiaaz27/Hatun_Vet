function iniciarOperacionesCaja() {
    $('#btnAbrirCaja').click(abrirCaja);
    $('#formMovimiento').submit(registrarMovimientoManual);
    $('#formCierre').submit(cerrarCaja);
}

function abrirCaja() {
    const btn = $('#btnAbrirCaja');
    const monto = $('#txtMontoApertura').val();

    btn.prop('disabled', true).text('Abriendo...');

    fetch(`${API_URL}/abrir?montoApertura=${monto}&usuario=${usuarioActivo}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(data => {
            btn.prop('disabled', false).text('Confirmar Apertura');

            if (data.success) {
                Swal.fire('Éxito', data.message, 'success');
                verificarEstadoCaja();
                return;
            }

            Swal.fire('Atención', data.message, 'warning');
        });
}

function registrarMovimientoManual(e) {
    e.preventDefault();

    const btn = $('#btnGuardarMovimiento');
    btn.prop('disabled', true).text('Registrando...');

    const params = new URLSearchParams({
        tipo: $('#tipoMovimiento').val(),
        monto: $('#montoManual').val(),
        descripcion: $('#descripcionManual').val(),
        medioPago: $('#medioPagoManual').val()
    });

    fetch(`${API_URL}/movimiento-manual?${params.toString()}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(data => manejarRespuestaMovimiento(data, btn));
}

function manejarRespuestaMovimiento(data, btn) {
    btn.prop('disabled', false).text('Registrar Movimiento');

    if (data.success) {
        modalMovimiento.hide();
        $('#formMovimiento')[0].reset();
        verificarEstadoCaja();
        Swal.fire('Éxito', data.message, 'success');
        return;
    }

    Swal.fire('Error', data.message, 'error');
}

function cerrarCaja(e) {
    e.preventDefault();

    const btn = $('#btnConfirmarCierre');
    btn.prop('disabled', true).text('Procesando Arqueo...');

    const monto = $('#montoCierreReal').val();

    fetch(`${API_URL}/cerrar?montoCierreReal=${monto}&usuario=${usuarioActivo}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(data => manejarRespuestaCierre(data, btn));
}