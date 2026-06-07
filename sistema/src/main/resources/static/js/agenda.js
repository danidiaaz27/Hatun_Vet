document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const modalNuevaCita = new bootstrap.Modal(document.getElementById('modalNuevaCita'));
    const modalCheckIn = new bootstrap.Modal(document.getElementById('modalCheckIn'));

    // 1. Inicializar FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek', // Vista de semana con horas
        locale: 'es',
        slotMinTime: '08:00:00', // Horario de apertura clínica
        slotMaxTime: '20:00:00', // Horario de cierre clínica
        allDaySlot: false,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        // Cargar eventos desde nuestro backend
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/api/citas')
                .then(response => response.json())
                .then(data => {
                    let events = data.map(cita => {
                        // Asignar colores según nuestro motor de estados
                        let colorClass = 'bg-agendada';
                        if(cita.estado === 'EN_ESPERA') colorClass = 'bg-espera';
                        if(cita.estado === 'EN_ATENCION') colorClass = 'bg-atencion';
                        if(cita.estado === 'FINALIZADA') colorClass = 'bg-secondary';

                        return {
                            id: cita.id,
                            title: cita.motivoPrincipal + ` (${cita.estado})`,
                            start: cita.fechaHoraProgramada,
                            className: colorClass,
                            extendedProps: { estado: cita.estado }
                        };
                    });
                    successCallback(events);
                })
                .catch(error => failureCallback(error));
        },
        // Al hacer clic en una cita existente
        eventClick: function(info) {
            const estado = info.event.extendedProps.estado;
            
            // Si está agendada, el Counter hace el Check-in
            if (estado === 'AGENDADA') {
                document.getElementById('citaIdCheckIn').value = info.event.id;
                document.getElementById('lblMotivoCheckIn').innerText = `Motivo: ${info.event.title}`;
                document.getElementById('checkAvisoCosto').checked = false;
                modalCheckIn.show();
            } else {
                Swal.fire('Información', `Esta cita ya se encuentra en estado: ${estado}`, 'info');
            }
        }
    });
    calendar.render();

    // 2. Guardar Nueva Cita
    document.getElementById('formNuevaCita').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // CORRECCIÓN APLICADA: .value en lugar de .val
        const fecha = document.getElementById('fechaCita').value;
        const hora = document.getElementById('horaCita').value;
        const fechaHora = `${fecha}T${hora}:00`;

        const payload = {
            mascota: { id: document.getElementById('mascotaId').value }, // Requiere IDs válidos en tu BD
            veterinario: { id: document.getElementById('medicoId').value },
            fechaHoraProgramada: fechaHora,
            motivoPrincipal: document.getElementById('motivoCita').value
        };

        fetch('/api/citas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalNuevaCita.hide();
                calendar.refetchEvents(); // Recargar el calendario
                Swal.fire('Éxito', res.message, 'success');
                this.reset();
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        });
    });

    // 3. Procesar el Check-In (Pasar paciente a En Espera)
    document.getElementById('btnProcesarCheckIn').addEventListener('click', function() {
        if (!document.getElementById('checkAvisoCosto').checked) {
            Swal.fire('Atención', 'Debe confirmar que informó el costo base al cliente.', 'warning');
            return;
        }

        const idCita = document.getElementById('citaIdCheckIn').value;
        const btn = this;
        btn.disabled = true;
        btn.innerText = "Procesando...";

        fetch(`/api/citas/${idCita}/check-in`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                btn.disabled = false;
                btn.innerText = "Marcar Llegada (Pasar a Espera)";
                
                if (res.success) {
                    modalCheckIn.hide();
                    calendar.refetchEvents();
                    Swal.fire('Check-in Exitoso', res.message, 'success');
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            });
    });
});