function iniciarAccionesClientes() {
    window.eliminarCliente = eliminarCliente;
}

function eliminarCliente(id) {
    Swal.fire({
        title: '¿Eliminar cliente?',
        text: 'Se verificará que no tenga historial de ventas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    }).then(result => {
        if (result.isConfirmed) ejecutarEliminarCliente(id);
    });
}

function ejecutarEliminarCliente(id) {
    fetch(`${API_URL}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                dataTable.ajax.reload();
                Swal.fire('Eliminado', 'Cliente eliminado', 'success');
                return;
            }

            Swal.fire('No permitido', res.message, 'error');
        });
}