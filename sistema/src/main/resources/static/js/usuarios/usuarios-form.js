function iniciarFormularioUsuarios() {
    $('#btnNuevoRegistro').click(abrirModalNuevoUsuario);
    $('#formUsuario').submit(guardarUsuario);
}

function abrirModalNuevoUsuario() {
    $('#formUsuario')[0].reset();
    $('#id').val('');
    $('#clave').prop('required', true).attr('type', 'password');
    resetearIconoClave();
    $('#claveHelp').hide();
    $('#modalTitle').text('Nuevo Usuario');
    usuarioModal.show();
}

function guardarUsuario(e) {
    e.preventDefault();

    const login = $('#usuario').val().trim();
    const nombre = $('#nombre').val().trim();
    const clave = '';
    const id = $('#id').val() || null;

    if (!validarFormularioUsuario(login, nombre, clave, id)) return;

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadUsuario(id, nombre, login, clave))
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                usuarioModal.hide();
                recargarTablaUsuarios();
                Swal.fire('Éxito', data.message, 'success');
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}

function crearPayloadUsuario(id, nombre, login, clave) {
    return {
        id: id,
        nombre: nombre,
        usuario: login,
        passwordHash: clave,
        perfil: { id: $('#id_perfil').val() }
    };
}
