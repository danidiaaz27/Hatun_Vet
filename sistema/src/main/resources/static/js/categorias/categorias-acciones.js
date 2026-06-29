function iniciarAccionesCategorias() {
    $('#tablaCategorias tbody').on('click', '.action-edit', editarCategoria);
    $('#tablaCategorias tbody').on('click', '.action-status', cambiarEstadoCategoria);
    $('#tablaCategorias tbody').on('click', '.action-delete', confirmarEliminarCategoria);
}

function editarCategoria() {
    fetch(`${API_BASE}/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarCategoriaEnModal(res.data);
        });
}

function cargarCategoriaEnModal(categoria) {
    $('#id').val(categoria.id);
    $('#nombre').val(categoria.nombre);
    $('#descripcion').val(categoria.descripcion);
    $('#modalTitle').text('Editar Categoría');
    categoriaModal.show();
}

function cambiarEstadoCategoria() {
    fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, {
        method: 'POST'
    }).then(() => dataTable.ajax.reload());
}

function confirmarEliminarCategoria() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar Categoría?',
        text: 'Se verificará que no haya productos asociados a ella.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F',
        confirmButtonText: 'Sí, eliminar'
    }).then(result => {
        if (result.isConfirmed) eliminarCategoria(id);
    });
}

function eliminarCategoria(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                dataTable.ajax.reload();
                Swal.fire('Eliminada', data.message, 'success');
                return;
            }

            Swal.fire('No se puede eliminar', data.message, 'error');
        });
}