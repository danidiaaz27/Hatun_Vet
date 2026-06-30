function iniciarFormularioPerfiles() {
    $('#btnNuevoRegistro').click(abrirModalNuevoPerfil);
    $('#formPerfil').submit(guardarPerfil);
}

function abrirModalNuevoPerfil() {
    $('#formPerfil')[0].reset();
    $('#id').val('');
    $('#modalTitle').text('Nuevo Perfil');
    perfilModal.show();
}

function guardarPerfil(e) {
    e.preventDefault();

    const nombre = $('#nombre').val().trim();

    if (!validarPerfil(nombre)) return;

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadPerfil())
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                perfilModal.hide();
                recargarTablaPerfiles();
                Swal.fire('Éxito', data.message, 'success');
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}