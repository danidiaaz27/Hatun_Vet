function iniciarFormularioNuevaCita() {
    document.getElementById('formNuevaCita')
        .addEventListener('submit', guardarNuevaCita);
}
function guardarNuevaCita(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;
    if (!hora) {
        Swal.fire('Atención', 'Debe seleccionar un horario disponible.', 'warning');
        return;
    }
    if (!validarFechaCita(fecha)) return;
    const mascotaVal = document.getElementById('mascotaId').value;
    const medicoVal = document.getElementById('medicoId').value;
    if (!validarDatosCita(mascotaVal, medicoVal)) return;
    fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadCita(fecha, hora, mascotaVal, medicoVal))
    })
    .then(r => r.json())
    .then(res => manejarRespuestaNuevaCita(res, e.target))
    .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la cita.', 'error');
    });
}
function validarFechaCita(fecha) {
    if (!fecha) {
        Swal.fire('Atención', 'Debe seleccionar una fecha para la cita.', 'warning');
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${fecha}T00:00:00`);

    if (selectedDate < today) {
        Swal.fire('Atención',
            'No se puede agendar una cita para un día anterior a hoy.',
            'warning');
        return false;
    }

    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);

    if (selectedDate > maxDate) {
        Swal.fire('Atención',
            'No se puede agendar una cita con más de 3 meses de anticipación.',
            'warning');
        return false;
    }

    return true;
}
function validarDatosCita(mascotaVal, medicoVal) {
    if (!mascotaVal) {
        Swal.fire('Atención', 'Debe seleccionar una mascota válida.', 'warning');
        return false;
    }
    if (!medicoVal) {
        Swal.fire('Atención', 'Debe seleccionar un médico veterinario.', 'warning');
        return false;
    }
    return true;
}
function crearPayloadCita(fecha, hora, mascotaVal, medicoVal) {
    return {
        mascota: { id: parseInt(mascotaVal) },
        veterinario: { id: medicoVal },
        fechaHoraProgramada: `${fecha}T${hora}:00`,
        motivoPrincipal: document.getElementById('motivoCita').value
    };
}
function manejarRespuestaNuevaCita(res, form) {
    if (!res.success) {
        Swal.fire('Conflicto o Error', res.message, 'error');
        return;
    }
    modalNuevaCita.hide();
    calendar.refetchEvents();
    Swal.fire('Éxito', res.message, 'success');
    form.reset();
    limpiarSeleccionPropietario();
    ocultarRegistroRapido();
    document.getElementById('contenedorSlots').innerHTML = '';
    slotSeleccionado = null;
}

function iniciarCheckIn() {
    document.getElementById('btnProcesarCheckIn')
        .addEventListener('click', procesarCheckIn);
    document.getElementById('btnNoAsistio')
        .addEventListener('click', confirmarNoShow);
    document.getElementById('btnCancelarCita')
        .addEventListener('click', confirmarCancelacion);
}

function abrirModalGestionCita(event) {
    document.getElementById('citaIdCheckIn').value = event.id;
    document.getElementById('lblMotivoCheckIn').innerText = `Motivo: ${event.title}`;
    document.getElementById('checkAvisoCosto').checked = false;

    // "No Asistió" solo tiene sentido si la hora programada ya pasó
    const fechaProgramada = event.start;
    const yaVencida = fechaProgramada && fechaProgramada.getTime() < Date.now();
    document.getElementById('btnNoAsistio').style.display = yaVencida ? 'inline-flex' : 'none';

    modalCheckIn.show();
}

function procesarCheckIn() {
    if (!document.getElementById('checkAvisoCosto').checked) {
        Swal.fire('Atención',
            'Debe confirmar que informó el costo base al cliente.',
            'warning');
        return;
    }
    const idCita = document.getElementById('citaIdCheckIn').value;
    const btn = document.getElementById('btnProcesarCheckIn');
    cambiarEstadoBotonCheckIn(btn, true);
    fetch(`/api/citas/${idCita}/check-in`, { method: 'POST' })
        .then(r => r.json())
        .then(res => manejarRespuestaCheckIn(res, btn))
        .catch(err => {
            console.error(err);
            cambiarEstadoBotonCheckIn(btn, false);
            Swal.fire('Error', 'No se pudo procesar el check-in.', 'error');
        });
}
function manejarRespuestaCheckIn(res, btn) {
    cambiarEstadoBotonCheckIn(btn, false);
    if (res.success) {
        modalCheckIn.hide();
        calendar.refetchEvents();
        Swal.fire('Check-in Exitoso', res.message, 'success');
        return;
    }
    Swal.fire('Error', res.message, 'error');
}
function cambiarEstadoBotonCheckIn(btn, procesando) {
    btn.disabled = procesando;
    btn.innerText = procesando
        ? 'Procesando...'
        : 'Marcar Llegada';
}

// --- NO ASISTIÓ ---
function confirmarNoShow() {
    const idCita = document.getElementById('citaIdCheckIn').value;
    Swal.fire({
        title: '¿Marcar como No Asistió?',
        text: 'Esta acción liberará el horario y quedará registrado que el paciente no llegó.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, no asistió',
        cancelButtonText: 'Volver'
    }).then(result => {
        if (result.isConfirmed) procesarNoShow(idCita);
    });
}

function procesarNoShow(idCita) {
    fetch(`/api/citas/${idCita}/no-show`, { method: 'POST' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalCheckIn.hide();
                calendar.refetchEvents();
                Swal.fire('Registrado', res.message, 'success');
                return;
            }
            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo procesar la acción.', 'error');
        });
}

// --- CANCELAR CITA ---
function confirmarCancelacion() {
    const idCita = document.getElementById('citaIdCheckIn').value;
    Swal.fire({
        title: '¿Cancelar esta cita?',
        text: 'El horario quedará disponible nuevamente para otros pacientes.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar cita',
        cancelButtonText: 'Volver'
    }).then(result => {
        if (result.isConfirmed) procesarCancelacion(idCita);
    });
}

function procesarCancelacion(idCita) {
    fetch(`/api/citas/${idCita}/cancelar`, { method: 'POST' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalCheckIn.hide();
                calendar.refetchEvents();
                Swal.fire('Cancelada', res.message, 'success');
                return;
            }
            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo cancelar la cita.', 'error');
        });
}