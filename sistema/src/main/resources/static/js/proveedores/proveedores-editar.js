function iniciarEdicionProveedor() {
    $('#tablaProveedores tbody').on('click', '.action-edit', editarProveedor);
}

function editarProveedor() {
    const id = $(this).data('id');

    fetch(`${API_BASE}/${id}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                cargarProveedorEnModal(res.data);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        });
}

function cargarProveedorEnModal(proveedor) {
    $('#id').val(proveedor.id);
    $('#nombre').val(proveedor.nombre);
    $('#ruc').val(proveedor.ruc);
    $('#telefono').val(proveedor.telefono || '');
    $('#correo').val(proveedor.correo || '');
    $('#direccion').val(proveedor.direccion || '');
    $('#contacto').val(proveedor.contacto || '');
    $('#estado').val(String(proveedor.estado));

    abrirModalProveedor('Editar Proveedor');
}