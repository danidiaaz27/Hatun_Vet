function iniciarEdicionProducto() {
    $('#tablaProductos tbody').on('click', '.action-edit', editarProducto);
}

function editarProducto() {
    fetch(`${API_BASE}/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarProductoEnModal(res.data);
        });
}

function cargarProductoEnModal(producto) {
    $('#id').val(producto.id);
    $('#codigo').val(producto.codigo);
    $('#nombre').val(producto.nombre);
    $('#descripcion').val(producto.descripcion);
    $('#precio').val(producto.precio);
    $('#id_categoria').val(producto.categoria ? producto.categoria.id : '');
    $('#proveedor_id').val(producto.proveedor ? producto.proveedor.id : '');
    $('#imagenFile').val('');

    cargarTipoProducto(producto);
    abrirModalProducto('Editar Producto');
}

function cargarTipoProducto(producto) {
    if (producto.esServicio) {
        $('#esServicio').prop('checked', true).trigger('change');
        return;
    }

    $('#esServicio').prop('checked', false).trigger('change');
    $('#stock').val(producto.stock);
    cargarFraccionamientoProducto(producto);
}

function cargarFraccionamientoProducto(producto) {
    if (producto.fraccionable) {
        $('#fraccionable').prop('checked', true);
        $('#seccionFraccionamiento').show();
        $('#unidadMedida').val(producto.unidadMedida).prop('required', true);
        $('#capacidadTotal').val(producto.capacidadTotal).prop('required', true);
        $('#precioFraccionado').val(producto.precioFraccionado).prop('required', true);
        return;
    }

    $('#fraccionable').prop('checked', false);
    $('#seccionFraccionamiento').hide();
    $('#unidadMedida').val('').prop('required', false);
    $('#capacidadTotal').val('').prop('required', false);
    $('#precioFraccionado').val('').prop('required', false);
}