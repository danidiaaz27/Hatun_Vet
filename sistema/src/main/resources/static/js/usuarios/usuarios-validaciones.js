function iniciarValidacionesUsuario() {
    $('#nombre').on('input', function() {
        this.value = this.value.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
            ''
        );
    });
}

function validarPassword(pwd) {
    if (pwd.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!/[A-Z]/.test(pwd)) {
        return 'La contraseña debe contener al menos una letra mayúscula.';
    }

    if (!/[a-z]/.test(pwd)) {
        return 'La contraseña debe contener al menos una letra minúscula.';
    }

    if (!/[0-9]/.test(pwd)) {
        return 'La contraseña debe contener al menos un número.';
    }

    if (!/[^a-zA-Z0-9\s]/.test(pwd)) {
        return 'La contraseña debe contener al menos un carácter especial.';
    }

    return null;
}

function validarFormularioUsuario(login, nombre, clave, id) {
    if (login.includes(' ')) {
        Swal.fire('Error', 'El usuario no puede contener espacios', 'error');
        return false;
    }

    if (!validarNombreUsuario(nombre)) return false;
    if (!validarClaveUsuario(clave, id)) return false;

    return true;
}

function validarNombreUsuario(nombre) {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    if (!regexNombre.test(nombre)) {
        Swal.fire('Error', 'El nombre solo debe contener letras.', 'error');
        return false;
    }

    return true;
}

function validarClaveUsuario(clave, id) {
    if (id) return true;

    const confirmarClave = $('#confirmarClaveInicial').val().trim();

    if (!clave) {
        Swal.fire(
            'Error',
            'La contraseña inicial es obligatoria para nuevos usuarios.',
            'error'
        );
        return false;
    }

    if (!confirmarClave) {
        Swal.fire(
            'Error',
            'Debe confirmar la contraseña inicial.',
            'error'
        );
        return false;
    }

    if (clave !== confirmarClave) {
        Swal.fire(
            'Error',
            'Las contraseñas no coinciden.',
            'error'
        );
        return false;
    }

    const errorPwd = validarPassword(clave);

    if (errorPwd) {
        Swal.fire('Contraseña insegura', errorPwd, 'warning');
        return false;
    }

    return true;
}