function iniciarValidacionesCliente() {
    $('#numeroDocumento').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $('#nombreCompleto').on('input', function () {
        this.value = this.value.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,&]/g,
            ''
        );
    });

    $('#telefono').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

function validarFormularioCliente() {
    const tipoDoc = $('#tipoDocumento').val();
    const numDoc = $('#numeroDocumento').val().trim();
    const nombre = $('#nombreCompleto').val().trim();
    const telf = $('#telefono').val().trim();

    if (tipoDoc === '1' && numDoc.length !== 8) {
        Swal.fire(
            'Atención',
            'El DNI debe tener exactamente 8 dígitos.',
            'warning'
        );
        return false;
    }

    if (tipoDoc === '6' && numDoc.length !== 11) {
        Swal.fire(
            'Atención',
            'El RUC debe tener exactamente 11 dígitos.',
            'warning'
        );
        return false;
    }

    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.,&]+$/;

    if (!regex.test(nombre)) {
        Swal.fire(
            'Atención',
            'El Nombre Completo o Razón Social solo debe contener letras.',
            'warning'
        );
        return false;
    }

    if (telf.length > 0 && telf.length < 7) {
        Swal.fire(
            'Atención',
            'El número de teléfono debe tener al menos 7 dígitos.',
            'warning'
        );
        return false;
    }

    return true;
}