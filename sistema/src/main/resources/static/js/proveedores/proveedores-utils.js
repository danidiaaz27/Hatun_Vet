function recargarTablaProveedores() {
    dataTable.ajax.reload();
}

function limpiarFormularioProveedor() {
    $('#formProveedor')[0].reset();

    $('#id').val('');

    $('#estado').val('true');

    $('#comprobanteFile').val('');
    $('#lblComprobanteActual').text('');
}

function abrirModalProveedor(titulo) {
    $('#modalTitle').text(titulo);
    proveedorModal.show();
}

function mostrarSpinnerGuardarProveedor() {
    $('#btnGuardarProveedor')
        .prop('disabled', true)
        .html(
            '<span class="spinner-border spinner-border-sm"></span> Guardando...'
        );
}

function restaurarBotonGuardarProveedor() {
    $('#btnGuardarProveedor')
        .prop('disabled', false)
        .html('Guardar Proveedor');
}