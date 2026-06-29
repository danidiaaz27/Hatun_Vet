function validarFechaNacimiento(fechaNac) {
    if (!fechaNac) return true;

    const dateNac = new Date(fechaNac + 'T00:00:00');

    if (dateNac.getFullYear() < 2008) {
        Swal.fire('Atención', 'El año no puede ser menor a 2008.', 'warning');
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateNac > today) {
        Swal.fire('Atención', 'La fecha no puede ser posterior a hoy.', 'warning');
        return false;
    }

    return true;
}

function crearPayloadRegistroRapido(nombreMascota) {
    return {
        tipoDocumento: document.getElementById('regTipoDoc').value,
        numeroDocumento: document.getElementById('regNumDoc').value.trim(),
        nombreCompleto: document.getElementById('regNombreDueno').value.trim(),
        telefono: document.getElementById('regTelefono').value.trim() || null,
        correo: document.getElementById('regCorreo').value.trim() || null,
        nombreMascota,
        especie: document.getElementById('regEspecie').value,
        raza: document.getElementById('regRaza').value.trim() || null,
        sexo: document.getElementById('regSexo').value,
        fechaNacimiento: document.getElementById('regFechaNac').value || null,
        color: document.getElementById('regColor').value.trim() || null,
        observaciones: document.getElementById('regObservaciones').value.trim() || null
    };
}

function manejarRespuestaRegistroRapido(res, nombreDueno, numDoc) {
    if (!res.success) {
        Swal.fire('Error', res.message || 'Error al guardar registro rápido.', 'error');
        return;
    }

    Swal.fire('Registrado', 'Cliente y mascota registrados con éxito.', 'success');

    cargarClientes();
    ocultarRegistroRapido();

    document.getElementById('buscarDuenoInput').value = `${nombreDueno} (${numDoc})`;
    document.getElementById('duenoIdSeleccionado').value = res.clienteId;
    document.getElementById('buscarDuenoInput').disabled = true;
    document.getElementById('btnLimpiarDueno').style.display = 'block';

    cargarMascotasCliente(res.clienteId, res.mascotaId);
}
function iniciarUtilidadesAgenda() {
    $('#regNombreMascota, #regRaza, #regColor').on('input', function() {
        this.value = this.value.replace(/[0-9]/g, '');
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const fechaCitaEl = document.getElementById('fechaCita');
    if (fechaCitaEl) fechaCitaEl.setAttribute('min', todayStr);

    const regFechaNacEl = document.getElementById('regFechaNac');
    if (regFechaNacEl) regFechaNacEl.setAttribute('max', todayStr);
}