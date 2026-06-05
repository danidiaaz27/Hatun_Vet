document.addEventListener('DOMContentLoaded', function() {
    const API_URL = '/api/citas';
    let pacienteEnAtencionId = null;
    let mascotaActualId = null;
    const modalHistorial = new bootstrap.Modal(document.getElementById('modalHistorial'));

    function cargarTorreControl() {
        fetch(API_URL)
            .then(r => r.json())
            .then(citas => {
                const listaEspera = document.getElementById('listaEspera');
                listaEspera.innerHTML = '';
                let countEspera = 0;
                let hayPacienteActivo = false;

                citas.forEach(cita => {
                    // Procesar pacientes en Espera
                    if (cita.estado === 'EN_ESPERA') {
                        countEspera++;
                        
                        // Blindaje 1: Parseo seguro de la fecha
                        let fechaLlegada = cita.fechaHoraLlegada;
                        if (Array.isArray(fechaLlegada)) {
                            // Si Spring Boot lo mandó como Array [2026, 6, 5, 11, 38]
                            fechaLlegada = new Date(fechaLlegada[0], fechaLlegada[1]-1, fechaLlegada[2], fechaLlegada[3]||0, fechaLlegada[4]||0);
                        } else {
                            fechaLlegada = new Date(fechaLlegada);
                        }
                        const hora = fechaLlegada.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                        
                        // Blindaje 2: Parseo seguro del ID de la Mascota
                        const mId = cita.mascota && cita.mascota.id ? String(cita.mascota.id).substring(0,6) : 'N/A';

                        const card = document.createElement('div');
                        card.className = 'card shadow-sm border-0 espera-card p-3 mb-2';
                        card.innerHTML = `
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <small class="text-muted fw-bold d-block mb-1"><i class="bi bi-clock"></i> Llegó: ${hora}</small>
                                    <h6 class="fw-bold text-dark mb-1">${cita.motivoPrincipal}</h6>
                                    <span class="badge bg-light text-secondary border">Mascota ID: ${mId}</span>
                                </div>
                                <button class="btn btn-sm btn-success fw-bold btn-iniciar" data-id="${cita.id}" data-mascota="${cita.mascota?.id || ''}">
                                    <i class="bi bi-play-fill"></i> Atender
                                </button>
                            </div>
                        `;
                        listaEspera.appendChild(card);
                    }
                    
                    // Detectar si el médico ya tiene a alguien En Atención
                    if (cita.estado === 'EN_ATENCION') {
                        hayPacienteActivo = true;
                        pacienteEnAtencionId = cita.id;
                        mascotaActualId = cita.mascota?.id;
                        
                        document.getElementById('lblMotivoActivo').innerText = cita.motivoPrincipal;
                        
                        let fechaInicio = cita.fechaHoraLlegada; // Para simplificar usamos la de llegada
                        if (!Array.isArray(fechaInicio)) fechaInicio = new Date(fechaInicio);
                        else fechaInicio = new Date(); // Fallback rápido
                        
                        document.getElementById('lblHoraInicio').innerText = new Date(fechaInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                        document.getElementById('citaActivaId').value = cita.id;
                        document.getElementById('mascotaActivaId').value = mascotaActualId;
                    }
                });

                document.getElementById('contadorEspera').innerText = countEspera;

                if (hayPacienteActivo) {
                    document.getElementById('panelVacio').style.display = 'none';
                    document.getElementById('panelActivo').style.display = 'block';
                } else {
                    document.getElementById('panelVacio').style.display = 'block';
                    document.getElementById('panelActivo').style.display = 'none';
                    document.getElementById('formAnamnesis').reset();
                    pacienteEnAtencionId = null;
                    mascotaActualId = null;
                }

                document.querySelectorAll('.btn-iniciar').forEach(btn => {
                    btn.addEventListener('click', function() {
                        iniciarAtencion(this.getAttribute('data-id'));
                    });
                });
            })
            .catch(err => console.error("Error al cargar la Torre de Control:", err));
    }

    function iniciarAtencion(idCita) {
        if (pacienteEnAtencionId) {
            Swal.fire('Consultorio Ocupado', 'Finalice la consulta actual antes de llamar a un nuevo paciente.', 'warning');
            return;
        }

        fetch(`${API_URL}/${idCita}/iniciar-atencion`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                if (res.success) cargarTorreControl();
                else Swal.fire('Error', res.message, 'error');
            });
    }

    document.getElementById('formAnamnesis').addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('btnGuardarAnamnesis');
        
        const payload = {
            pesoKg: parseFloat(document.getElementById('pesoKg').value),
            temperaturaC: parseFloat(document.getElementById('tempC').value),
            frecuenciaCardiaca: parseInt(document.getElementById('frecCard').value) || null,
            sintomas: document.getElementById('sintomas').value,
            diagnosticoPresuntivo: document.getElementById('diagnostico').value,
            tratamientoIndicado: document.getElementById('tratamiento').value
        };

        btn.disabled = true;
        btn.innerText = "Guardando...";

        fetch(`${API_URL}/${pacienteEnAtencionId}/guardar-anamnesis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            btn.disabled = false;
            btn.innerText = "Guardar Registro";
            if (res.success) Swal.fire('Actualizado', 'Anamnesis guardada correctamente.', 'success');
            else Swal.fire('Error', res.message, 'error');
        });
    });

    document.getElementById('btnFinalizarConsulta').addEventListener('click', function() {
        Swal.fire({
            title: '¿Finalizar Consulta?',
            text: "La cuenta médica se enviará a la Caja para su cobro.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar a caja'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/${pacienteEnAtencionId}/finalizar`, { method: 'POST' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('Finalizado', res.message, 'success');
                            cargarTorreControl();
                        } else Swal.fire('Falta Registro Clínico', res.message, 'error');
                    });
            }
        });
    });

    document.getElementById('btnVerHistorial').addEventListener('click', function() {
        if(!mascotaActualId) mascotaActualId = document.getElementById('mascotaActivaId').value;

        fetch(`${API_URL}/historial/${mascotaActualId}`)
            .then(r => r.json())
            .then(historial => {
                const contenedor = document.getElementById('timelineHistorial');
                contenedor.innerHTML = '';

                if(historial.length === 0) {
                    contenedor.innerHTML = '<div class="text-center text-muted p-4">No hay atenciones previas registradas para esta mascota.</div>';
                    modalHistorial.show();
                    return;
                }

                let html = '<div class="border-start border-3 border-primary ms-3 ps-4 position-relative">';
                historial.forEach(h => {
                    const fecha = new Date(h.fecha).toLocaleDateString('es-PE', { year:'numeric', month:'short', day:'numeric' });
                    html += `
                        <div class="mb-4 position-relative">
                            <span class="position-absolute translate-middle p-2 bg-primary border border-light border-3 rounded-circle" style="left: -1.6rem; top: 0.2rem;"></span>
                            <div class="card shadow-sm border-0">
                                <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-2">
                                    <strong class="text-primary"><i class="bi bi-calendar-event me-1"></i> ${fecha}</strong>
                                    <small class="text-muted"><i class="bi bi-person-badge"></i> Dr/a. ${h.medico}</small>
                                </div>
                                <div class="card-body py-2">
                                    <div class="d-flex gap-3 mb-2 small text-danger fw-bold border-bottom pb-2">
                                        <span>Peso: ${h.peso} kg</span>
                                        <span>Temp: ${h.temp} °C</span>
                                    </div>
                                    <p class="mb-1 small"><strong>Síntomas:</strong> ${h.sintomas}</p>
                                    <p class="mb-1 small"><strong>Diagnóstico:</strong> ${h.diagnostico}</p>
                                    <p class="mb-0 small"><strong>Tratamiento:</strong> ${h.tratamiento}</p>
                                </div>
                            </div>
                        </div>`;
                });
                html += '</div>';
                contenedor.innerHTML = html;
                modalHistorial.show();
            });
    });

    cargarTorreControl();
    setInterval(cargarTorreControl, 10000); 
});