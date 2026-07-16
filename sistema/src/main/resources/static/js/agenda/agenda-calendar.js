let calendar = null;

function iniciarCalendario() {
    const calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'es',
        slotMinTime: '00:00:00',
        slotMaxTime: '24:00:00',
        scrollTime: '08:00:00',
        allDaySlot: false,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: cargarEventosCalendario,
        eventClick: manejarClickEvento
    });

    calendar.render();
}

function cargarEventosCalendario(fetchInfo, successCallback, failureCallback) {
    fetch('/api/citas')
        .then(response => response.json())
        .then(data => {
            const events = data.map(cita => ({
                id: cita.id,
                title: obtenerTituloCita(cita),
                start: cita.fechaHoraProgramada,
                className: obtenerClaseEstado(cita.estado),
                extendedProps: { estado: cita.estado }
            }));

            successCallback(events);
        })
        .catch(error => failureCallback(error));
}

function obtenerClaseEstado(estado) {
    if (estado === 'EN_ESPERA') return 'bg-espera';
    if (estado === 'EN_ATENCION') return 'bg-atencion';
    if (estado === 'FINALIZADA') return 'bg-secondary';
    if (estado === 'COBRADA') return 'bg-cobrada';
    if (estado === 'PAGO_PARCIAL') return 'bg-pago-parcial';
    if (estado === 'CANCELADA') return 'bg-cancelada';
    if (estado === 'NO_ASISTIO') return 'bg-no-show';

    return 'bg-agendada';
}

function obtenerTituloCita(cita) {
    const mascotaNombre = cita.mascota ? cita.mascota.nombre : 'Sin Mascota';

    const duenoNombre = cita.mascota && cita.mascota.cliente
        ? cita.mascota.cliente.nombreCompleto
        : 'Sin Dueño';

    return `${mascotaNombre} (${duenoNombre}) - ${cita.motivoPrincipal}`;
}

function formatearEstado(estado) {
    const nombres = {
        EN_ESPERA: 'En Espera',
        EN_ATENCION: 'En Atención',
        FINALIZADA: 'Finalizada',
        COBRADA: 'Cobrada',
        PAGO_PARCIAL: 'Pago Parcial',
        CANCELADA: 'Cancelada',
        NO_ASISTIO: 'No Asistió'
    };
    return nombres[estado] || estado;
}

function manejarClickEvento(info) {
    const estado = info.event.extendedProps.estado;

    if (estado === 'AGENDADA') {
        abrirModalGestionCita(info.event);
        return;
    }

    Swal.fire('Información', `Esta cita ya se encuentra en estado: ${formatearEstado(estado)}`, 'info');
}