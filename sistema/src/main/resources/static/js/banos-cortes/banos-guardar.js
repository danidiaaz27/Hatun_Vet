function iniciarNuevoServicio() {
    $('#btnNuevoServicio').click(() => {
        $('#formServicio')[0].reset();

        limpiarSeleccionMascota();
        cargarTiposServicio();

        $('#btnGuardarServicio').prop('disabled', false).html('Guardar Registro');

        modalServicio.show();
    });
}

function iniciarGuardarServicio() {
    $('#formServicio').submit(e => {
        e.preventDefault();

        const mascotaId = normalizarTexto($('#mascotaId').val());

        if (!mascotaId) {
            Swal.fire('Atención', 'Debe seleccionar una mascota del padrón', 'warning');
            return;
        }

        const productoId = $('#tipoServicioSelect').val();

        if (!productoId) {
            Swal.fire(
                'Atención',
                'Debes seleccionar un tipo de servicio del catálogo',
                'warning'
            );
            return;
        }

        const precio = parseFloat($('#precio').val());

        if (precio <= 0) {
            Swal.fire('Atención', 'El precio debe ser mayor a cero.', 'warning');
            return;
        }

        guardarServicio(mascotaId, productoId, precio);
    });
}

function guardarServicio(mascotaId, productoId, precio) {
    const btnGuardar = $('#btnGuardarServicio');

    btnGuardar.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Guardando...'
    );

    fetch(`${API_URL}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadServicio(mascotaId, productoId, precio))
    })
        .then(r => r.json())
        .then(res => manejarRespuestaGuardarServicio(res, btnGuardar))
        .catch(() => {
            Swal.fire('Error', 'No se pudo guardar el servicio', 'error');
            btnGuardar.prop('disabled', false).html('Guardar Registro');
        });
}

function crearPayloadServicio(mascotaId, productoId, precio) {
    return {
        mascotaId: Number(mascotaId),
        productoId: productoId,
        detallesExtra: $('#detallesExtra').val(),
        precio: precio
    };
}

function manejarRespuestaGuardarServicio(res, btnGuardar) {
    if (res.success) {
        modalServicio.hide();
        cargarServicios();
        Swal.fire('Éxito', res.message, 'success');
        return;
    }

    Swal.fire('Error', res.message, 'error');
    btnGuardar.prop('disabled', false).html('Guardar Registro');
}