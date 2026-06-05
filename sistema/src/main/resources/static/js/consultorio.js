document.addEventListener('DOMContentLoaded', function() {
    const API_URL = '/api/citas';
    let pacienteEnAtencionId = null;

    // 1. Cargar el Monitor Clínico
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
                        const hora = new Date(cita.fechaHoraLlegada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                        
                        const card = document.createElement('div');
                        card.className = 'card shadow-sm border-0 espera-card p-3 mb-2';
                        card.innerHTML = `
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <small class="text-muted fw-bold d-block mb-1"><i class="bi bi-clock"></i> Llegó: ${hora}</small>
                                    <h6 class="fw-bold text-dark mb-1">${cita.motivoPrincipal}</h6>
                                    <span class="badge bg-light text-secondary border">Mascota ID: ${cita.mascota?.id?.substring(0,6) || 'N/A'}</span>
                                </div>
                                <button class="btn btn-sm btn-success fw-bold btn-iniciar" data-id="${cita.id}">
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
                        document.getElementById('lblMotivoActivo').innerText = cita.motivoPrincipal;
                        document.getElementById('lblHoraInicio').innerText = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                        document.getElementById('citaActivaId').value = cita.id;
                    }
                });

                document.getElementById('contadorEspera').innerText = countEspera;

                // Alternar la vista del consultorio
                if (hayPacienteActivo) {
                    document.getElementById('panelVacio').style.display = 'none';
                    document.getElementById('panelActivo').style.display = 'block';
                } else {
                    document.getElementById('panelVacio').style.display = 'block';
                    document.getElementById('panelActivo').style.display = 'none';
                    document.getElementById('formAnamnesis').reset();
                    pacienteEnAtencionId = null;
                }

                // Asignar eventos a los botones de Atender recién creados
                document.querySelectorAll('.btn-iniciar').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        iniciarAtencion(id);
                    });
                });
            });
    }

    // 2. Iniciar Atención Médica
    function iniciarAtencion(idCita) {
        if (pacienteEnAtencionId) {
            Swal.fire('Consultorio Ocupado', 'Finalice la consulta actual antes de llamar a un nuevo paciente.', 'warning');
            return;
        }

        fetch(`${API_URL}/${idCita}/iniciar-atencion`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    cargarTorreControl(); // Refresca las columnas
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            });
    }

    // 3. Guardar Anamnesis (Regla LEAN Estricta)
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
            
            if (res.success) {
                Swal.fire('Historial Actualizado', 'La anamnesis se ha guardado correctamente. Ya puede finalizar la cita o agregar insumos.', 'success');
            } else {
                Swal.fire('Datos Incompletos', res.message, 'error');
            }
        });
    });

    // 4. Finalizar Cita (Enviar a Caja)
    document.getElementById('btnFinalizarConsulta').addEventListener('click', function() {
        Swal.fire({
            title: '¿Finalizar Consulta?',
            text: "El paciente pasará a estado FINALIZADO y su cuenta se enviará a la Caja para el cobro.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#212529',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, enviar a caja'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/${pacienteEnAtencionId}/finalizar`, { method: 'POST' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            Swal.fire('Finalizado', res.message, 'success');
                            cargarTorreControl(); // El consultorio volverá a estar libre
                        } else {
                            // Si salta el error del backend porque no llenaron la anamnesis
                            Swal.fire('Falta Registro Clínico', res.message, 'error');
                        }
                    });
            }
        });
    });

    // Iniciar el monitor
    cargarTorreControl();

    // Opcional: Actualización en vivo (Polling) cada 10 segundos para ver si el counter agendó a alguien
    setInterval(cargarTorreControl, 10000); 
});