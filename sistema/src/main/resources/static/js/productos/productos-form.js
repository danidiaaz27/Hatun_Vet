function iniciarFormularioProducto() {
    $('#btnNuevoRegistro').click(abrirNuevoProducto);
    $('#formProducto').submit(guardarProducto);
}

function abrirNuevoProducto() {
    limpiarFormularioProducto();
    abrirModalProducto('Nuevo Producto');
}

function guardarProducto(e) {
    e.preventDefault();

    if (!validarImagenProducto()) return;

    mostrarSpinnerGuardar();

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        body: crearFormDataProducto()
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                productoModal.hide();
                recargarTablaProductos();
                Swal.fire('Éxito', data.message, 'success');
                return;
            }

            Swal.fire('Atención', data.message, 'warning');
        })
        .catch(() =>
            Swal.fire('Error', 'Fallo de conexión.', 'error')
        )
        .finally(restaurarBotonGuardar);
}

function crearFormDataProducto() {
    const formData = new FormData();

    if ($('#id').val()) formData.append('id', $('#id').val());

    formData.append('codigo', $('#codigo').val().trim());
    formData.append('nombre', $('#nombre').val().trim());
    formData.append('descripcion', $('#descripcion').val().trim());
    formData.append('precio', $('#precio').val());
    formData.append('stock', $('#stock').val());
    formData.append('categoria.id', $('#id_categoria').val());
    formData.append('esServicio', $('#esServicio').is(':checked'));
    formData.append('fraccionable', $('#fraccionable').is(':checked'));

    agregarDatosFraccionables(formData);
    agregarProveedorProducto(formData);
    agregarImagenProducto(formData);

    return formData;
}
function agregarDatosFraccionables(formData) {
    const esFraccionable = $('#fraccionable').is(':checked');
    const esServicio = $('#esServicio').is(':checked');

    if (!esFraccionable || esServicio) return;

    formData.append('unidadMedida', $('#unidadMedida').val().trim());
    formData.append('capacidadTotal', $('#capacidadTotal').val());
    formData.append('precioFraccionado', $('#precioFraccionado').val());
}

function agregarProveedorProducto(formData) {
    const proveedorId = $('#proveedor_id').val();

    if (proveedorId) {
        formData.append('proveedor.id', proveedorId);
    }
}

function agregarImagenProducto(formData) {
    const fileInput = document.getElementById('imagenFile');

    if (fileInput.files.length > 0) {
        formData.append('imagenFile', fileInput.files[0]);
    }
}