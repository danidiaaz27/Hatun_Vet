function iniciarValidacionesProveedor() {
    $('#ruc').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
    });

    $('#telefono').on('input', function() {
        let val = this.value.replace(/[^0-9]/g, '');

        if (val.length > 0 && val[0] !== '9') {
            val = '';
        }

        this.value = val.slice(0, 9);
    });

    $('#contacto').on('input', function() {
        this.value = this.value.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
            ''
        );
    });
}

function validarRucProveedor(ruc) {
    if (ruc.length !== 11) {
        Swal.fire('Validación', 'El RUC debe tener 11 dígitos.', 'warning');
        return false;
    }

    const prefijo = ruc.substring(0, 2);

    if (!['10', '15', '17', '20'].includes(prefijo)) {
        Swal.fire(
            'Validación',
            'El RUC debe empezar con 10, 15, 17 o 20.',
            'warning'
        );
        return false;
    }

    return true;
}

function validarTelefonoProveedor(telefono) {
    if (!telefono) return true;

    if (telefono.length !== 9 || !telefono.startsWith('9')) {
        Swal.fire(
            'Validación',
            'El teléfono debe tener exactamente 9 dígitos y comenzar con 9.',
            'warning'
        );
        return false;
    }

    return true;
}

function validarContactoProveedor(contacto) {
    if (!contacto) return true;

    const regexContacto = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

    if (!regexContacto.test(contacto)) {
        Swal.fire(
            'Validación',
            'La persona de contacto solo debe contener letras.',
            'warning'
        );
        return false;
    }

    return true;
}