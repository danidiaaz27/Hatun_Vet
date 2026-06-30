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

    mostrarSpinnerGuardarProveedor();

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadProveedor(ruc, telefono, contacto))
    })
        .then(r => r.json())
        .then(res => manejarRespuestaGuardarProveedor(res))
        .catch(() =>
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error')
        )
        .finally(restaurarBotonGuardarProveedor);
}

function crearPayloadProveedor(ruc, telefono, contacto) {
    return {
        id: $('#id').val() || null,
        nombre: $('#nombre').val().trim(),
        ruc: ruc,
        telefono: telefono,
        correo: $('#correo').val().trim(),
        direccion: $('#direccion').val().trim(),
        contacto: contacto,
        estado: $('#estado').val() === 'true'
    };
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