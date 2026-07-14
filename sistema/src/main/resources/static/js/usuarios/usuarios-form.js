function iniciarFormularioUsuarios() {
    $('#btnNuevoRegistro').click(abrirModalNuevoUsuario);
    $('#formUsuario').submit(guardarUsuario);
}

function abrirModalNuevoUsuario() {
    $('#formUsuario')[0].reset();
    $('#id').val('');

    mostrarClaveInicial();
    ocultarCambioClave();

    $('#modalTitle').text('Nuevo Usuario');
    usuarioModal.show();
}

function guardarUsuario(e) {
    e.preventDefault();

    const login = $('#usuario').val().trim();
    const nombre = $('#nombre').val().trim();
    const id = $('#id').val() || null;
    const clave = obtenerClaveSegunModo(id);

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

function obtenerClaveSegunModo(id) {
    if (id) return '';
    return $('#clave').val().trim();
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

function mostrarClaveInicial() {
    $('#bloqueClaveInicial').show();
    $('#clave').prop('required', true);
    $('#confirmarClaveInicial').prop('required', true);
}

function ocultarClaveInicial() {
    $('#bloqueClaveInicial').hide();
    $('#clave').prop('required', false).val('');
    $('#confirmarClaveInicial').prop('required', false).val('');
}

function ocultarCambioClave() {
    $('#bloqueCambioClave').hide();
}

function mostrarCambioClave() {
    $('#bloqueCambioClave').show();
    ocultarClaveInicial();
}
$('.btn-toggle-pass').click(function () {

    const input = $($(this).data('target'));
    const icon = $(this).find('i');

    if (input.attr('type') === 'password') {

        input.attr('type', 'text');

        icon.removeClass('bi-eye-fill')
            .addClass('bi-eye-slash-fill');

    } else {

        input.attr('type', 'password');

        icon.removeClass('bi-eye-slash-fill')
            .addClass('bi-eye-fill');
    }

});