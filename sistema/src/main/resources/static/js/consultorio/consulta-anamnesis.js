function iniciarFormularioAnamnesis() {
    document.getElementById('formAnamnesis')
        .addEventListener('submit', guardarAnamnesis);

    document.getElementById('btnFinalizarConsulta')
        .addEventListener('click', confirmarFinalizarConsulta);
}

function cargarConsultaActiva(citaId) {
    fetch(`${API_URL}/${citaId}/consulta`)
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data) {
                cargarDatosConsulta(res.data);
                return;
            }

            limpiarFormularioConsulta(citaId);
        })
        .catch(err =>
            console.error('Error al cargar la consulta activa:', err)
        );
}

function cargarDatosConsulta(data) {
    document.getElementById('pesoKg').value = data.pesoKg || '';
    document.getElementById('tempC').value = data.temperaturaC || '';
    document.getElementById('frecCard').value = data.frecuenciaCardiaca || '';
    document.getElementById('sintomas').value = data.sintomas || '';
    document.getElementById('diagnostico').value =
        data.diagnosticoPresuntivo || '';
    document.getElementById('tratamiento').value =
        data.tratamientoIndicado || '';
    document.getElementById('fechaProximaCita').value =
        data.fechaProximaCita || '';
    document.getElementById('nombreProximaVacuna').value =
        data.nombreProximaVacuna || '';
    document.getElementById('fechaProximaVacuna').value =
        data.fechaProximaVacuna || '';
    document.getElementById('nombreProximoDesparasitante').value =
        data.nombreProximoDesparasitante || '';
    document.getElementById('fechaProximaDesparasitacion').value =
        data.fechaProximaDesparasitacion || '';
}

function limpiarFormularioConsulta(citaId) {
    document.getElementById('formAnamnesis').reset();
    document.getElementById('citaActivaId').value = citaId;
    document.getElementById('mascotaActivaId').value = mascotaActualId;
}

function guardarAnamnesis(e) {
    e.preventDefault();

    const btn = document.getElementById('btnGuardarAnamnesis');

    btn.disabled = true;
    btn.innerText = 'Guardando...';

    fetch(`${API_URL}/${pacienteEnAtencionId}/guardar-anamnesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadAnamnesis())
    })
        .then(r => r.json())
        .then(res => manejarRespuestaAnamnesis(res, btn));
}

function crearPayloadAnamnesis() {
    return {
        pesoKg: parseFloat(document.getElementById('pesoKg').value),
        temperaturaC: parseFloat(document.getElementById('tempC').value),
        frecuenciaCardiaca:
            parseInt(document.getElementById('frecCard').value) || null,
        sintomas: document.getElementById('sintomas').value,
        diagnosticoPresuntivo: document.getElementById('diagnostico').value,
        tratamientoIndicado: document.getElementById('tratamiento').value,
        fechaProximaCita:
            document.getElementById('fechaProximaCita').value || null,
        nombreProximaVacuna:
            document.getElementById('nombreProximaVacuna').value || null,
        fechaProximaVacuna:
            document.getElementById('fechaProximaVacuna').value || null,
        nombreProximoDesparasitante:
            document.getElementById('nombreProximoDesparasitante').value || null,
        fechaProximaDesparasitacion:
            document.getElementById('fechaProximaDesparasitacion').value || null
    };
}

function manejarRespuestaAnamnesis(res, btn) {
    btn.disabled = false;
    btn.innerText = 'Guardar Registro';

    if (res.success) {
        Swal.fire('Actualizado', 'Anamnesis guardada correctamente.', 'success');
        return;
    }

    Swal.fire('Error', res.message, 'error');
}

function confirmarFinalizarConsulta() {
    Swal.fire({
        title: '¿Finalizar Consulta?',
        text: 'La cuenta médica se enviará a la Caja para su cobro.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar a caja'
    }).then(result => {
        if (result.isConfirmed) finalizarConsulta();
    });
}

function finalizarConsulta() {
    fetch(`${API_URL}/${pacienteEnAtencionId}/finalizar`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Finalizado', res.message, 'success');
                cargarTorreControl();
                return;
            }

            Swal.fire('Falta Registro Clínico', res.message, 'error');
        });
}