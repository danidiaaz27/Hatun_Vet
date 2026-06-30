function iniciarAccionesProducto() {
    $('#tablaProductos tbody').on('click', '.action-status', cambiarEstadoProducto);
    $('#tablaProductos tbody').on('click', '.action-delete', confirmarEliminarProducto);
}

function cambiarEstadoProducto() {
    fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, {
        method: 'POST'
    }).then(() => recargarTablaProductos());
}

function confirmarEliminarProducto() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Solo se podrá eliminar si no tiene historial de ventas o inventario.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, intentar eliminar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) eliminarProducto(id);
    });
}

function eliminarProducto(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                recargarTablaProductos();
                Swal.fire('Eliminado', data.message, 'success');
                return;
            }

            Swal.fire('No permitido', data.message, 'error');
        });
}