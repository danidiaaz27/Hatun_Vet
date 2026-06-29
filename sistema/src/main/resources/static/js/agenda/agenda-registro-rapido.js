function iniciarRegistroRapido() {
    const btnToggle = document.getElementById('btnToggleRegistroRapido');
    const btnCancelar = document.getElementById('btnCancelarRegRapido');
    const btnCerrar = document.getElementById('btnCerrarRegRapidoHeader');
    const btnGuardar = document.getElementById('btnGuardarRegRapido');

    btnToggle.addEventListener('click', mostrarRegistroRapido);
    btnCancelar.addEventListener('click', ocultarRegistroRapido);
    btnCerrar.addEventListener('click', ocultarRegistroRapido);
    btnGuardar.addEventListener('click', guardarRegistroRapido);
}

function mostrarRegistroRapido() {
    limpiarSeleccionPropietario();
    document.getElementById('seccionRegistroRapido').style.display = 'block';
    document.getElementById('btnToggleRegistroRapido').style.display = 'none';
}

function ocultarRegistroRapido() {
    document.getElementById('seccionRegistroRapido').style.display = 'none';
    document.getElementById('btnToggleRegistroRapido').style.display = 'block';

    ['regNumDoc','regNombreDueno','regTelefono','regCorreo',
     'regNombreMascota','regRaza','regFechaNac','regColor','regObservaciones']
        .forEach(id => document.getElementById(id).value = '');
}

function guardarRegistroRapido() {
    const numDoc = document.getElementById('regNumDoc').value.trim();
    const nombreDueno = document.getElementById('regNombreDueno').value.trim();
    const nombreMascota = document.getElementById('regNombreMascota').value.trim();

    if (!validarRegistroRapido(numDoc, nombreDueno, nombreMascota)) return;

    fetch('/mascotas/api/registro-rapido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadRegistroRapido(nombreMascota))
    })
    .then(r => r.json())
    .then(res => manejarRespuestaRegistroRapido(res, nombreDueno, numDoc))
    .catch(err => {
        console.error(err);
        Swal.fire('Error', 'Error en el servidor.', 'error');
    });
}

function validarRegistroRapido(numDoc, nombreDueno, nombreMascota) {
    if (!numDoc || !nombreDueno || !nombreMascota) {
        Swal.fire('Atención',
            'El documento del dueño, nombre del dueño y nombre de la mascota son obligatorios.',
            'warning');
        return false;
    }

    const raza = document.getElementById('regRaza').value.trim();
    const color = document.getElementById('regColor').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value;

    if (/[0-9]/.test(nombreMascota)) return alertaValidacion('El nombre de la mascota no puede contener números.');
    if (/[0-9]/.test(raza)) return alertaValidacion('La raza no puede contener números.');
    if (/[0-9]/.test(color)) return alertaValidacion('El color no puede contener números.');
    if (!validarFechaNacimiento(fechaNac)) return false;

    const tipoDoc = document.getElementById('regTipoDoc').value;
    if (tipoDoc === "1" && numDoc.length !== 8) return alertaValidacion('El DNI debe tener 8 dígitos.');
    if (tipoDoc === "6" && numDoc.length !== 11) return alertaValidacion('El RUC debe tener 11 dígitos.');

    return true;
}

function alertaValidacion(mensaje) {
    Swal.fire('Atención', mensaje, 'warning');
    return false;
}