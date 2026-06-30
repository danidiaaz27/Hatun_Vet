function iniciarEliminacionPerfiles() {
    $('#tablaPerfiles tbody').on('click', '.action-delete', confirmarEliminarPerfil);
}

function confirmarEliminarPerfil() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar perfil?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F'
    }).then(result => {
        if (result.isConfirmed) eliminarPerfil(id);
    });
}

function eliminarPerfil(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                recargarTablaPerfiles();
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}