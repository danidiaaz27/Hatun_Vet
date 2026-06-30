function validarPropietarioMascota(id, tieneClienteExistente, tieneRegistroRapido) {
    if (!tieneClienteExistente && !tieneRegistroRapido && !id) {
        Swal.fire(
            'Atención',
            'Selecciona un dueño existente o completa el registro rápido del dueño.',
            'warning'
        );
        return false;
    }

    return true;
}

function validarDatosMascota() {
    const nombre = $('#nombre').val().trim();
    const raza = $('#raza').val().trim();
    const color = $('#color').val().trim();
    const fechaNac = $('#fechaNacimiento').val();

    if (/[0-9]/.test(nombre)) {
        return alertaMascota('El nombre de la mascota no puede contener números.');
    }

    if (/[0-9]/.test(raza)) {
        return alertaMascota('La raza de la mascota no puede contener números.');
    }

    if (/[0-9]/.test(color)) {
        return alertaMascota('El color de la mascota no puede contener números.');
    }

    return validarFechaNacimientoMascota(fechaNac);
}

function validarFechaNacimientoMascota(fechaNac) {
    if (!fechaNac) return true;

    const dateNac = new Date(fechaNac + 'T00:00:00');

    if (dateNac.getFullYear() < 2008) {
        return alertaMascota(
            'El año de la fecha de nacimiento no puede ser menor a 2008.'
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateNac > today) {
        return alertaMascota(
            'La fecha de nacimiento no puede ser posterior al día actual.'
        );
    }

    return true;
}

function alertaMascota(mensaje) {
    Swal.fire('Atención', mensaje, 'warning');
    return false;
}

function guardarRegistroRapidoMascota() {
    enviarRegistroRapido()
        .then(res => {
            if (res.success) {
                cerrarYRefrescar(res.message || 'Mascota registrada correctamente.');
                return;
            }

            Swal.fire('Atención', res.message || 'No se pudo registrar', 'warning');
        })
        .catch(() =>
            Swal.fire('Error', 'No se pudo registrar la mascota', 'error')
        );
}

function guardarMascotaNormal() {
    enviarGuardar(obtenerMascotaDesdeFormulario())
        .then(res => {
            if (res.success) {
                cerrarYRefrescar(res.message || 'Mascota guardada correctamente.');
                return;
            }

            Swal.fire('Atención', res.message || 'No se pudo guardar', 'warning');
        })
        .catch(() =>
            Swal.fire('Error', 'No se pudo guardar la mascota', 'error')
        );
}

function iniciarRestriccionesMascota() {
    $('#nombre, #raza, #color').on('input', function() {
        this.value = this.value.replace(/[0-9]/g, '');
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const fechaNacEl = document.getElementById('fechaNacimiento');

    if (fechaNacEl) {
        fechaNacEl.setAttribute('max', todayStr);
    }
}