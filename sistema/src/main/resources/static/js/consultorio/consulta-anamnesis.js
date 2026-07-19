function iniciarFormularioAnamnesis() {
    document.getElementById('formAnamnesis')
        .addEventListener('submit', guardarAnamnesis);
    document.getElementById('btnFinalizarConsulta')
        .addEventListener('click', confirmarFinalizarConsulta);

    bloquearSimbolosNumericos(document.getElementById('pesoKg'));
    bloquearSimbolosNumericos(document.getElementById('tempC'));
}

// --- NUEVO: bloquea símbolos no numéricos (e, E, +, -) en campos numéricos ---
function bloquearSimbolosNumericos(input) {
    if (!input) return;

    input.addEventListener('keydown', function(e) {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    });

    input.addEventListener('input', function() {
        const valorLimpio = this.value.replace(/[^0-9.]/g, '');
        if (valorLimpio !== this.value) {
            this.value = valorLimpio;
        }
    });

    input.addEventListener('paste', function(e) {
        const texto = (e.clipboardData || window.clipboardData).getData('text');
        if (/[^0-9.]/.test(texto)) {
            e.preventDefault();
        }
    });
}

// --- NUEVO: validación de fechas opcionales (no antes de hoy, no más de 3 meses) ---
function validarFechasAnamnesis() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const maxFecha = new Date(hoy);
    maxFecha.setMonth(maxFecha.getMonth() + 3);

    const campos = [
        { id: 'fechaProximaCita', label: 'la Próxima Cita' },
        { id: 'fechaProximaVacuna', label: 'la Próxima Vacuna' },
        { id: 'fechaProximaDesparasitacion', label: 'la Próxima Desparasitación' }
    ];

    for (const campo of campos) {
        const valor = document.getElementById(campo.id).value;
        if (!valor) continue;

        const fecha = new Date(`${valor}T00:00:00`);

        if (fecha < hoy) {
            Swal.fire('Atención',
                `La fecha de ${campo.label} no puede ser anterior a hoy.`,
                'warning');
            return false;
        }

        if (fecha > maxFecha) {
            Swal.fire('Atención',
                `La fecha de ${campo.label} no puede ser mayor a 3 meses desde hoy.`,
                'warning');
            return false;
        }
    }

    return true;
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

    if (!validarFechasAnamnesis()) return;

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