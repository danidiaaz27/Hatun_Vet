function iniciarAccionesProveedor() {
    $('#tablaProveedores tbody').on('click', '.action-status', cambiarEstadoProveedor);
    $('#tablaProveedores tbody').on('click', '.action-delete', confirmarEliminarProveedor);
}

function cambiarEstadoProveedor() {
    const id = $(this).data('id');

    fetch(`${API_BASE}/cambiar-estado/${id}`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                recargarTablaProveedores();
                return;
            }

            Swal.fire('Error', res.message, 'error');
        });
}

function confirmarEliminarProveedor() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar proveedor?',
        text: 'Se validará que no tenga productos asociados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#D32F2F',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) eliminarProveedor(id);
    });
}

function eliminarProveedor(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                recargarTablaProveedores();
                Swal.fire('Eliminado', res.message, 'success');
                return;
            }

            Swal.fire('Atención', res.message, 'error');
        });
}