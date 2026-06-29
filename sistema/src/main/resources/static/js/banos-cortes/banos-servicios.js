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

        confirmarCambioEstado(id, nuevoEstado);
    });
}

function confirmarCambioEstado(id, nuevoEstado) {
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
        if (result.isConfirmed) cambiarEstadoServicio(id, nuevoEstado);
    });
}

function cambiarEstadoServicio(id, nuevoEstado) {
    fetch(`${API_URL}/cambiar-estado/${id}?nuevoEstado=${nuevoEstado}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarServicios();
            else Swal.fire('Error', res.message, 'error');
        });
}