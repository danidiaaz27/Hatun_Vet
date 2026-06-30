function prepararFormulario(mascota = null) {
    $('#formMascota')[0].reset();
    $('#id').val('');
    $('#modoRegistro').val('existente');
    $('#clienteId').val('');
    $('#lblDuenoSeleccionado').text('Ninguno');
    $('#tabMascotaBtn').tab('show');

    if (mascota) cargarMascotaEnFormulario(mascota);

    const tabMascota = document.getElementById('tabMascotaBtn');

    if (tabMascota) {
        bootstrap.Tab.getOrCreateInstance(tabMascota).show();
    }
}

function cargarMascotaEnFormulario(mascota) {
    $('#id').val(mascota.id || '');
    $('#nombre').val(mascota.nombre || '');
    $('#especie').val(mascota.especie || '');
    $('#raza').val(mascota.raza || '');
    $('#sexo').val(mascota.sexo || '');
    $('#fechaNacimiento').val(
        mascota.fechaNacimiento
            ? String(mascota.fechaNacimiento).substring(0, 10)
            : ''
    );
    $('#color').val(mascota.color || '');
    $('#observaciones').val(mascota.observaciones || '');
    $('#estado').val(mascota.estado || 'ACTIVA');

    if (mascota.cliente && mascota.cliente.id) {
        $('#clienteId').val(mascota.cliente.id);
        setLabelDuenoSeleccionado(mascota.cliente);
    }
}

function obtenerMascotaDesdeFormulario() {
    const clienteId = normalizarTexto($('#clienteId').val());

    return {
        id: $('#id').val() ? Number($('#id').val()) : null,
        nombre: normalizarTexto($('#nombre').val()),
        especie: normalizarTexto($('#especie').val()),
        raza: normalizarTexto($('#raza').val()),
        sexo: normalizarTexto($('#sexo').val()),
        fechaNacimiento: $('#fechaNacimiento').val() || null,
        color: normalizarTexto($('#color').val()),
        observaciones: normalizarTexto($('#observaciones').val()),
        estado: normalizarTexto($('#estado').val()) || 'ACTIVA',
        cliente: clienteId ? { id: Number(clienteId) } : null
    };
}

function enviarGuardar(data) {
    const url = data.id
        ? `${API_URL}/actualizar/${data.id}`
        : `${API_URL}/guardar`;

    const method = data.id ? 'PUT' : 'POST';

    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

function enviarRegistroRapido() {
    const payload = crearPayloadRegistroRapidoMascota();

    return fetch(`${API_URL}/registro-rapido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(r => r.json());
}

function crearPayloadRegistroRapidoMascota() {
    return {
        clienteId: null,
        tipoDocumento: normalizarTexto($('#tipoDocumento').val()),
        numeroDocumento: normalizarTexto($('#numeroDocumento').val()),
        nombreCompleto: normalizarTexto($('#nombreCompleto').val()),
        telefono: normalizarTexto($('#telefono').val()),
        correo: normalizarTexto($('#correo').val()),
        nombreMascota: normalizarTexto($('#nombre').val()),
        especie: normalizarTexto($('#especie').val()),
        raza: normalizarTexto($('#raza').val()),
        sexo: normalizarTexto($('#sexo').val()),
        fechaNacimiento: $('#fechaNacimiento').val() || null,
        color: normalizarTexto($('#color').val()),
        observaciones: normalizarTexto($('#observaciones').val())
    };
}

function cerrarYRefrescar(mensaje) {
    modalMascota.hide();

    cargarMascotas(`${API_URL}/listar`, 'Listado general');
    cargarClientesSeleccion();

    Swal.fire('Éxito', mensaje, 'success');
}