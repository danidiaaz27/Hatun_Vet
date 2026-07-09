document.addEventListener('DOMContentLoaded', function () {
    const modalCorreo = new bootstrap.Modal(document.getElementById('modalRecuperarCorreo'));
    const modalCodigo = new bootstrap.Modal(document.getElementById('modalCodigoRecuperacion'));
    const modalNueva = new bootstrap.Modal(document.getElementById('modalNuevaPasswordRecuperacion'));

    document.getElementById('btnOlvidePassword').addEventListener('click', function (e) {
        e.preventDefault();
        modalCorreo.show();
    });

    document.getElementById('btnEnviarCodigoRecuperacion').addEventListener('click', enviarCodigoRecuperacion);
    document.getElementById('btnVerificarCodigoRecuperacion').addEventListener('click', verificarCodigoRecuperacion);
    document.getElementById('btnCambiarPasswordRecuperacion').addEventListener('click', cambiarPasswordRecuperacion);
});

function enviarCodigoRecuperacion() {
    const correo = document.getElementById('correoRecuperacion').value.trim();

    if (!correo) {
        Swal.fire('Validación', 'Ingresa tu correo.', 'warning');
        return;
    }

    const btn = document.getElementById('btnEnviarCodigoRecuperacion');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    fetch('/recuperar/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
    })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                Swal.fire('Atención', res.message, 'warning');
                return;
            }

            bootstrap.Modal.getInstance(document.getElementById('modalRecuperarCorreo')).hide();
            document.getElementById('codigoRecuperacion').value = '';
            new bootstrap.Modal(document.getElementById('modalCodigoRecuperacion')).show();
        })
        .catch(error => {
            console.error('ERROR REAL:', error);
            Swal.fire('Error', 'No se pudo enviar el código. Revisa la consola del backend.', 'error');
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane me-1"></i> Enviar código';
        });
}

function verificarCodigoRecuperacion() {
    const codigo = document.getElementById('codigoRecuperacion').value.trim();

    if (codigo.length !== 6) {
        Swal.fire('Validación', 'Ingresa el código de 6 dígitos.', 'warning');
        return;
    }

    const btn = document.getElementById('btnVerificarCodigoRecuperacion');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verificando...';

    fetch('/recuperar/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo })
    })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                document.getElementById('codigoRecuperacion').value = '';
                Swal.fire('Código incorrecto', res.message, 'error');
                return;
            }

            bootstrap.Modal.getInstance(document.getElementById('modalCodigoRecuperacion')).hide();
            limpiarNuevaPasswordRecuperacion();
            new bootstrap.Modal(document.getElementById('modalNuevaPasswordRecuperacion')).show();
        })
        .catch(() => Swal.fire('Error', 'No se pudo verificar el código.', 'error'))
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = 'Verificar';
        });
}

function cambiarPasswordRecuperacion() {
    const nuevaClave = document.getElementById('nuevaPasswordRecuperacion').value;
    const confirmarClave = document.getElementById('confirmarPasswordRecuperacion').value;

    if (!validarPasswordRecuperacion(nuevaClave, confirmarClave)) return;

    const btn = document.getElementById('btnCambiarPasswordRecuperacion');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

    fetch('/recuperar/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaClave })
    })
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                Swal.fire('Error', res.message, 'error');
                return;
            }

            bootstrap.Modal.getInstance(document.getElementById('modalNuevaPasswordRecuperacion')).hide();
            limpiarTodoRecuperacion();

            Swal.fire({
                icon: 'success',
                title: 'Contraseña actualizada',
                text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
                confirmButtonColor: '#0A3D91'
            });
        })
        .catch(() => Swal.fire('Error', 'No se pudo actualizar la contraseña.', 'error'))
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Guardar contraseña';
        });
}

function validarPasswordRecuperacion(pass, confirm) {
    if (pass.length < 6) {
        Swal.fire('Validación', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
        return false;
    }

    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass) || !/[^a-zA-Z0-9\s]/.test(pass)) {
        Swal.fire('Contraseña insegura', 'Debe incluir mayúscula, minúscula, número y carácter especial.', 'warning');
        return false;
    }

    if (pass !== confirm) {
        Swal.fire('Validación', 'Las contraseñas no coinciden.', 'warning');
        return false;
    }

    return true;
}

function limpiarNuevaPasswordRecuperacion() {
    document.getElementById('nuevaPasswordRecuperacion').value = '';
    document.getElementById('confirmarPasswordRecuperacion').value = '';
    document.getElementById('msgPasswordRecuperacion').textContent = 'Las contraseñas deben coincidir.';
}

function limpiarTodoRecuperacion() {
    document.getElementById('correoRecuperacion').value = '';
    document.getElementById('codigoRecuperacion').value = '';
    limpiarNuevaPasswordRecuperacion();
}