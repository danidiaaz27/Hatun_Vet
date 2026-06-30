function recargarTablaProductos() {
    dataTable.ajax.reload();
}

function limpiarFormularioProducto() {
    $('#formProducto')[0].reset();

    $('#id').val('');

    $('#esServicio')
        .prop('checked', false)
        .trigger('change');

    $('#fraccionable')
        .prop('checked', false)
        .trigger('change');

    $('#imagenFile').val('');
}

function mostrarSpinnerGuardar() {
    $('#btnSubmitProducto')
        .prop('disabled', true)
        .html('<span class="spinner-border spinner-border-sm"></span> Guardando...');
}

function restaurarBotonGuardar() {
    $('#btnSubmitProducto')
        .prop('disabled', false)
        .html('Guardar Producto');
}

function abrirModalProducto(titulo) {
    $('#modalTitle').text(titulo);
    productoModal.show();
}