function iniciarAccionesUsuarios() {
    $('#tablaUsuarios tbody').on('click', '.action-edit', editarUsuario);
    $('#tablaUsuarios tbody').on('click', '.action-status', cambiarEstadoUsuario);
    $('#tablaUsuarios tbody').on('click', '.action-delete', confirmarEliminarUsuario);
}
function editarUsuario() {
    fetch(`${API_BASE}/${$(this).data('id')}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarUsuarioEnModal(res.data);
        });
}
function cargarUsuarioEnModal(usuario) {
    $('#id').val(usuario.id);
    $('#nombre').val(usuario.nombre);
    $('#usuario').val(usuario.usuario);
    $('#id_perfil').val(usuario.perfil ? usuario.perfil.id : '');
        $('#modalTitle').text('Editar Usuario');
    usuarioModal.show();
}

function cambiarEstadoUsuario() {
    fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, {
        method: 'POST'
    }).then(() => recargarTablaUsuarios());
}

function confirmarEliminarUsuario() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Solo se desactivará',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F'
    }).then(result => {
        if (result.isConfirmed) eliminarUsuario(id);
    });
}

function eliminarUsuario(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                recargarTablaUsuarios();
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}

function iniciarCambioClaveUsuario() {
    const modalEnviarCodigo = new bootstrap.Modal(
        document.getElementById('modalEnviarCodigo')
    );

    $('#btnAbrirCambioClave').click(function () {
        modalEnviarCodigo.show();
    });

    $('#btnEnviarCodigo').click(function () {
        const btn = $(this);

        btn.prop('disabled', true).html(
            '<span class="spinner-border spinner-border-sm"></span> Enviando...'
        );

        fetch('/usuarios/api/enviar-codigo', {
            method: 'POST'
        })
            .then(r => r.json())
            .then(res => {
                if (!res.success) {
                    Swal.fire('Error', res.message, 'error');
                    return;
                }

                bootstrap.Modal.getInstance(
                    document.getElementById('modalEnviarCodigo')
                ).hide();

                $('#txtCodigoVerificacion').val('');

                new bootstrap.Modal(
                    document.getElementById('modalVerificarCodigo')
                ).show();
            })
            .catch(() => {
                Swal.fire('Error', 'No se pudo enviar el código.', 'error');
            })
            .finally(() => {
                btn.prop('disabled', false).html(
                    '<i class="bi bi-send-fill me-1"></i> Enviar código'
                );
            });
    });

}
$('#btnVerificarCodigo').click(function () {
    const codigo = $('#txtCodigoVerificacion').val().trim();

    if (codigo.length !== 6) {
        Swal.fire('Código inválido', 'Ingresa los 6 dígitos.', 'warning');
        return;
    }

    const btn = $(this);

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Verificando...'
    );

    fetch('/usuarios/api/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo })
    })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                Swal.fire('Código incorrecto', res.message, 'error');
                return;
            }

            bootstrap.Modal.getInstance(
                document.getElementById('modalVerificarCodigo')
            ).hide();

            new bootstrap.Modal(
                document.getElementById('modalNuevaClave')
            ).show();

            $('#txtCodigoVerificacion').val('');
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo verificar el código.', 'error');
        })
        .finally(() => {
            btn.prop('disabled', false).html('Verificar Código');
        });
});

$('.btn-toggle-new-pass').click(function () {
    const target = $($(this).data('target'));
    const icon = $(this).find('i');

    if (target.attr('type') === 'password') {
        target.attr('type', 'text');
        icon.removeClass('bi-eye-fill').addClass('bi-eye-slash-fill');
        return;
    }

    target.attr('type', 'password');
    icon.removeClass('bi-eye-slash-fill').addClass('bi-eye-fill');
});

$('#nuevaClave, #confirmarClave').on('input', validarNuevaClaveUI);

function validarNuevaClaveUI() {
    const pass = $('#nuevaClave').val();
    const confirm = $('#confirmarClave').val();

    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9\s]/.test(pass)) score++;

    const porcentaje = score * 25;
    $('#barraFortaleza').css('width', porcentaje + '%');

    if (score <= 1) $('#textoFortaleza').text('Contraseña débil.');
    else if (score <= 3) $('#textoFortaleza').text('Contraseña media.');
    else $('#textoFortaleza').text('Contraseña fuerte.');

    const coincide = pass && confirm && pass === confirm;
    const segura = score >= 4;

    $('#mensajeCoincidencia')
        .text(coincide ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.')
        .toggleClass('text-success', coincide)
        .toggleClass('text-danger', !coincide);

    $('#btnGuardarNuevaClave').prop('disabled', !(coincide && segura));
}
$('#btnGuardarNuevaClave').click(function () {
    const usuarioId = $('#id').val();
    const nuevaClave = $('#nuevaClave').val();
    const confirmarClave = $('#confirmarClave').val();

    if (!usuarioId) {
        Swal.fire('Atención', 'Primero debes seleccionar un usuario.', 'warning');
        return;
    }

    if (nuevaClave !== confirmarClave) {
        Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
        return;
    }

    const btn = $(this);

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Guardando...'
    );

    fetch('/usuarios/api/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usuarioId: usuarioId,
            nuevaClave: nuevaClave
        })
    })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                Swal.fire('Error', res.message, 'error');
                return;
            }

            bootstrap.Modal.getInstance(
                document.getElementById('modalNuevaClave')
            ).hide();

            limpiarModalNuevaClave();

            Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'La contraseña se cambió correctamente.',
                timer: 1800,
                showConfirmButton: false
            });
        })
        .catch(() => {
            Swal.fire('Error', 'No se pudo cambiar la contraseña.', 'error');
        })
        .finally(() => {
            btn.prop('disabled', true).html(
                '<i class="bi bi-check-circle me-1"></i> Guardar contraseña'
            );
        });
});

function limpiarModalNuevaClave() {
    $('#nuevaClave').val('');
    $('#confirmarClave').val('');
    $('#barraFortaleza').css('width', '0%');
    $('#textoFortaleza').text('Ingresa una contraseña segura.');
    $('#mensajeCoincidencia')
        .text('Ambas contraseñas deben coincidir.')
        .removeClass('text-success text-danger');
    $('#btnGuardarNuevaClave').prop('disabled', true);
}