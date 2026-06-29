function iniciarMovimientosInventario() {
    window.abrirModalIngreso = abrirModalIngreso;
    window.abrirModalSalida = abrirModalSalida;

    $('#checkVencimiento').change(alternarFechaVencimiento);
    $('#formIngreso').submit(registrarIngresoInventario);
    $('#formSalida').submit(registrarSalidaInventario);
}

function abrirModalIngreso(idProd, nombreProd) {
    $('#formIngreso')[0].reset();

    $('#ingresoIdProd').val(idProd);
    $('#ingresoNombreProd').text(nombreProd);

    $('#ingresoVencimiento')
        .addClass('d-none')
        .prop('required', false);

    modalIngreso.show();
}

function abrirModalSalida(idProd, nombreProd, stockActual) {
    $('#formSalida')[0].reset();

    $('#salidaIdProd').val(idProd);
    $('#salidaNombreProd').text(nombreProd);
    $('#salidaStockActual').text(stockActual);

    modalSalida.show();
}

function alternarFechaVencimiento() {
    if (this.checked) {
        $('#ingresoVencimiento')
            .removeClass('d-none')
            .prop('required', true);
        return;
    }

    $('#ingresoVencimiento')
        .addClass('d-none')
        .prop('required', false);
}

function registrarIngresoInventario(e) {
    e.preventDefault();

    if ($('#checkVencimiento').is(':checked') && !$('#ingresoVencimiento').val()) {
        Swal.fire('Atención', 'Seleccione la fecha de vencimiento.', 'warning');
        return;
    }

    const btn = $('#btnSubmitIngreso');

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Registrando...'
    );

    enviarMovimiento($('#ingresoIdProd').val(), crearPayloadIngreso(), modalIngreso, btn, 'Registrar Ingreso');
}

function registrarSalidaInventario(e) {
    e.preventDefault();

    const btn = $('#btnSubmitSalida');

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Registrando...'
    );

    enviarMovimiento($('#salidaIdProd').val(), crearPayloadSalida(), modalSalida, btn, 'Registrar Salida');
}

function crearPayloadIngreso() {
    return {
        tipoMovimiento: $('#ingresoTipo').val(),
        cantidad: parseInt($('#ingresoCantidad').val()),
        motivo: $('#ingresoMotivo').val(),
        proveedor: $('#ingresoProveedor').val(),
        numeroLote: $('#ingresoLote').val(),
        fechaVencimiento: $('#checkVencimiento').is(':checked')
            ? $('#ingresoVencimiento').val()
            : null
    };
}

function crearPayloadSalida() {
    return {
        tipoMovimiento: $('#salidaTipo').val(),
        cantidad: parseInt($('#salidaCantidad').val()),
        motivo: $('#salidaMotivo').val()
    };
}

function enviarMovimiento(idProducto, data, modal, btnElement, originalText) {
    fetch(`${API_URL}/registrar?idProducto=${idProducto}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(r => r.json())
        .then(res => manejarRespuestaMovimiento(res, modal))
        .catch(() =>
            Swal.fire('Error', 'Fallo de conexión con el servidor', 'error')
        )
        .finally(() =>
            btnElement.prop('disabled', false).html(originalText)
        );
}

function manejarRespuestaMovimiento(res, modal) {
    if (res.success) {
        modal.hide();
        dataTable.ajax.reload();
        Swal.fire('Éxito', res.message, 'success');
        return;
    }

    Swal.fire('Atención', res.message, 'warning');
}