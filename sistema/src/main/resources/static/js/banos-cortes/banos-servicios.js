function cargarServicios() {
    fetch(`${API_URL}/listar`)
        .then(r => r.json())
        .then(res => {
            todosLosServicios = (res.data || []).sort((a, b) =>
                new Date(b.fechaServicio) - new Date(a.fechaServicio)
            );

            paginaActual = 1;
            renderCards();
        })
        .catch(() => {
            $('#groomingGrid').html(`
                <div class="grooming-empty">
                    <i class="bi bi-exclamation-triangle text-danger"></i>
                    Error al cargar los servicios
                </div>`);
        });
}

function iniciarPaginacionYFiltro() {
    $('#btnPrev').click(() => {
        if (paginaActual > 1) {
            paginaActual--;
            renderCards();
        }
    });

    $('#btnNext').click(() => {
        paginaActual++;
        renderCards();
    });

    $('#filtroEstado').on('change', () => {
        paginaActual = 1;
        renderCards();
    });
}

function iniciarCambioEstado() {
    $('#groomingGrid').on('click', '.btn-cambiar-estado', function () {
        const id = $(this).data('id');
        const nuevoEstado = $(this).data('estado');
        const btn = $(this);

        confirmarCambioEstado(id, nuevoEstado, btn);
    });
}

function confirmarCambioEstado(id, nuevoEstado, btn) {
    let label = '¿Cambiar estado?';
    let confirmText = 'Sí, cambiar';

    if (nuevoEstado === 'EN_PROCESO') {
        label = '¿Iniciar el servicio de grooming?';
        confirmText = 'Sí, iniciar';
    } else if (nuevoEstado === 'TERMINADO') {
        label = '¿Finalizar servicio de grooming?';
        confirmText = 'Sí, finalizar';
    }

    Swal.fire({
        title: label,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1a6e40',
        cancelButtonColor: '#6b7a99',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) cambiarEstadoServicio(id, nuevoEstado, btn);
    });
}

function cambiarEstadoServicio(id, nuevoEstado, btn) {
    if (btn) btn.prop('disabled', true);

    fetch(`${API_URL}/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                cargarServicios();
                return;
            }
            Swal.fire('Error', res.message, 'error');
            if (btn) btn.prop('disabled', false);
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo cambiar el estado del servicio.', 'error');
            if (btn) btn.prop('disabled', false);
        });
}

// --- NUEVO: CANCELAR SERVICIO ---
function iniciarCancelarServicio() {
    $('#groomingGrid').on('click', '.btn-cancelar-servicio', function () {
        const id = $(this).data('id');
        const btn = $(this);
        confirmarCancelacionServicio(id, btn);
    });
}

function confirmarCancelacionServicio(id, btn) {
    Swal.fire({
        title: '¿Cancelar este servicio?',
        text: 'El registro quedará marcado como cancelado y no aparecerá para cobro en Caja.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#6b7a99',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver'
    }).then(result => {
        if (result.isConfirmed) cancelarServicio(id, btn);
    });
}

function cancelarServicio(id, btn) {
    if (btn) btn.prop('disabled', true);

    fetch(`${API_URL}/cancelar/${id}`, { method: 'POST' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                cargarServicios();
                Swal.fire('Cancelado', res.message, 'success');
                return;
            }
            Swal.fire('Error', res.message, 'error');
            if (btn) btn.prop('disabled', false);
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo cancelar el servicio.', 'error');
            if (btn) btn.prop('disabled', false);
        });
}