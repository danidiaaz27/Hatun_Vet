function iniciarAccionesImagenes() {
    $('#landingImagesBody').on('click', '.action-edit-img', editarImagenLanding);
    $('#landingImagesBody').on('click', '.action-delete-img', confirmarEliminarImagen);
}

function editarImagenLanding() {
    fetch(`${API_BASE}/imagenes/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarImagenEnModal(res.data);
        });
}

function cargarImagenEnModal(imagen) {
    $('#landingId').val(imagen.id);
    $('#tipo').val(imagen.tipo);
    $('#estado').val(imagen.estado ? 'true' : 'false');

    landingModal.show();
}

function confirmarEliminarImagen() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar imagen?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F',
        cancelButtonColor: '#6b7a99',
        confirmButtonText: 'Sí, eliminar'
    }).then(res => {
        if (res.isConfirmed) eliminarImagenLanding(id);
    });
}

function eliminarImagenLanding(id) {
    fetch(`${API_BASE}/imagenes/eliminar/${id}`, {
        method: 'DELETE'
    }).then(() => cargarImagenes());
}