function iniciarBusquedaMascotas() {
    $('#btnBuscarMascota').click(() => buscarMascotas());

    $('#txtBuscarMascota').on('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarMascotas();
        }
    });
    $('#panelResultadosMascota').on('click', '.mascota-result-item', function () {
        cargarMascotaPorId(Number($(this).data('id')));
    });
    $('#btnLimpiarMascota').click(() => limpiarSeleccionMascota());
}
function limpiarSeleccionMascota() {
    mascotaSeleccionada = null;
    $('#mascotaId').val('');
    $('#panelMascotaSeleccionada').addClass('d-none');
    $('#panelResultadosMascota').addClass('d-none').empty();
    $('#txtBuscarMascota')
        .val('')
        .prop('disabled', false);
    $('#btnBuscarMascota')
        .prop('disabled', false);
}
function seleccionarMascota(mascota) {
    mascotaSeleccionada = mascota;
    $('#mascotaId').val(mascota.id);
    $('#panelResultadosMascota').addClass('d-none').empty();
    $('#lblMascotaInicial').text(
        (mascota.nombre || '?').charAt(0).toUpperCase()
    );
    $('#lblMascotaNombre').text(
        `${mascota.nombre || ''} (ID #${mascota.id})`
    );
    $('#lblMascotaDetalle').text(
        `${mascota.especie || 'Sin especie'} · ${mascota.raza || 'Sin raza'}`
    );
    mostrarDatosDuenoMascota(mascota);
    $('#lblFechaRegistroMascota').text(
        mascota.fechaRegistro
            ? `Registrada: ${formatDateTime(mascota.fechaRegistro)}`
            : ''
    );
    $('#panelMascotaSeleccionada').removeClass('d-none');
    $('#txtBuscarMascota').prop('disabled', true);
    $('#btnBuscarMascota').prop('disabled', true);
}
function mostrarDatosDuenoMascota(mascota) {
    const cliente = mascota.cliente;
    if (cliente) {
        $('#lblDuenoDetalle').html(
            `<i class="bi bi-person-badge me-1"></i>${cliente.nombreCompleto || 'Sin nombre'} · ${cliente.numeroDocumento || 'Sin doc'}`
        );
        return;
    }
    $('#lblDuenoDetalle').html(
        '<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Sin dueño vinculado</span>'
    );
}
function buscarMascotas() {
    const valor = normalizarTexto($('#txtBuscarMascota').val());
    if (!valor) {
        Swal.fire(
            'Atención',
            'Ingrese el ID o nombre de la mascota',
            'warning'
        );
        return;
    }
    const btn = $('#btnBuscarMascota');
    btn.prop('disabled', true)
       .html('<span class="spinner-border spinner-border-sm"></span>');
    fetch(`${MASCOTAS_API_URL}/buscar/${encodeURIComponent(valor)}`)
        .then(r => r.json())
        .then(res => {
            const activas = (res.data || []).filter(
                m => (m.estado || 'ACTIVA').toUpperCase() === 'ACTIVA'
            );
            renderResultadosMascota(activas);
            if (activas.length === 1) {
                seleccionarMascota(activas[0]);
            }
        })
        .catch(() =>
            Swal.fire('Error', 'No se pudo buscar en el padrón', 'error')
        )
        .finally(() =>
            btn.prop('disabled', false).html('Buscar')
        );
}
function cargarMascotaPorId(id) {
    fetch(`${MASCOTAS_API_URL}/${id}`)
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data) {
                seleccionarMascota(res.data);
            }
        })
        .catch(() =>
            Swal.fire('Error', 'No se pudo cargar la mascota', 'error')
        );
}