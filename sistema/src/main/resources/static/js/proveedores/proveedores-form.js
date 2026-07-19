function iniciarFormularioProveedor() {
    $('#btnNuevoProveedor').click(abrirNuevoProveedor);
    $('#formProveedor').submit(guardarProveedor);
}

function abrirNuevoProveedor() {
    limpiarFormularioProveedor();
    abrirModalProveedor('Nuevo Proveedor');
}

function guardarProveedor(e) {
    e.preventDefault();

    const ruc = $('#ruc').val().trim();
    const telefono = $('#telefono').val().trim();
    const contacto = $('#contacto').val().trim();

    if (!validarRucProveedor(ruc)) return;
    if (!validarTelefonoProveedor(telefono)) return;
    if (!validarContactoProveedor(contacto)) return;
    if (!validarComprobanteProveedor()) return;

    mostrarSpinnerGuardarProveedor();

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        body: crearFormDataProveedor(ruc, telefono, contacto)
    })
        .then(r => r.json())
        .then(res => manejarRespuestaGuardarProveedor(res))
        .catch(() =>
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error')
        )
        .finally(restaurarBotonGuardarProveedor);
}

function crearFormDataProveedor(ruc, telefono, contacto) {
    const formData = new FormData();

    if ($('#id').val()) formData.append('id', $('#id').val());

    formData.append('nombre', $('#nombre').val().trim());
    formData.append('ruc', ruc);
    formData.append('telefono', telefono);
    formData.append('correo', $('#correo').val().trim());
    formData.append('direccion', $('#direccion').val().trim());
    formData.append('contacto', contacto);
    formData.append('estado', $('#estado').val() === 'true');

    const fileInput = document.getElementById('comprobanteFile');
    if (fileInput.files.length > 0) {
        formData.append('comprobanteFile', fileInput.files[0]);
    }

    return formData;
}

function validarComprobanteProveedor() {
    const fileInput = document.getElementById('comprobanteFile');

    if (fileInput.files.length === 0) return true;

    const archivo = fileInput.files[0];
    const esPdf = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
        Swal.fire('Validación', 'El comprobante debe ser un archivo PDF.', 'warning');
        return false;
    }

    return true;
}

function manejarRespuestaGuardarProveedor(res) {
    if (res.success) {
        proveedorModal.hide();
        recargarTablaProveedores();
        Swal.fire('Éxito', res.message, 'success');
        return;
    }

    Swal.fire('Atención', res.message, 'warning');
}