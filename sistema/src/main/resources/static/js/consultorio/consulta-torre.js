let ultimasCitasActivas = [];
let idPendienteSeleccion = null;

function cargarTorreControl() {
    fetch(API_URL)
        .then(r => r.json())
        .then(citas => {
            const listaEspera = document.getElementById('listaEspera');
            const listaEnAtencion = document.getElementById('listaEnAtencion');

            listaEspera.innerHTML = '';
            listaEnAtencion.innerHTML = '';

            let countEspera = 0;
            const pacientesActivos = [];

            citas.forEach(cita => {
                if (cita.estado === 'EN_ESPERA') {
                    countEspera++;
                    renderPacienteEspera(cita, listaEspera);
                }

                if (cita.estado === 'EN_ATENCION') {
                    pacientesActivos.push(cita);
                    renderPacienteEnAtencion(cita, listaEnAtencion);
                }
            });

            ultimasCitasActivas = pacientesActivos;

            actualizarPanelesConsulta(pacientesActivos, countEspera);
            conectarBotonesIniciarAtencion();
            conectarBotonesSeleccionarActivo();

            // Si acabamos de iniciar atención a un paciente, abrimos su panel automáticamente
            if (idPendienteSeleccion) {
                const idSeleccionar = idPendienteSeleccion;
                idPendienteSeleccion = null;
                seleccionarPacienteActivo(idSeleccionar);
            }
        })
        .catch(err =>
            console.error('Error al cargar la Torre de Control:', err)
        );
}

function renderPacienteEspera(cita, listaEspera) {
    const hora = obtenerHoraLlegada(cita.fechaHoraLlegada);
    const mascotaId = cita.mascota && cita.mascota.id
        ? String(cita.mascota.id).substring(0, 6)
        : 'N/A';

    const card = document.createElement('div');

    card.className = 'card shadow-sm border-0 espera-card p-3 mb-2';
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <small class="text-muted fw-bold d-block mb-1">
                    <i class="bi bi-clock"></i> Llegó: ${hora}
                </small>
                <h6 class="fw-bold text-dark mb-1">
                    ${cita.motivoPrincipal}
                </h6>
                <span class="badge bg-light text-secondary border">
                    Mascota ID: ${mascotaId}
                </span>
            </div>

            <button class="btn btn-sm btn-success fw-bold btn-iniciar"
                data-id="${cita.id}">
                <i class="bi bi-play-fill"></i> Atender
            </button>
        </div>
    `;

    listaEspera.appendChild(card);
}

// --- NUEVO: tarjeta de paciente "En Atención" (permite varios médicos en paralelo) ---
function renderPacienteEnAtencion(cita, listaEnAtencion) {
    const medicoNombre = cita.veterinario ? cita.veterinario.nombre : 'Médico';
    const esSeleccionada = cita.id === pacienteEnAtencionId;

    const card = document.createElement('div');
    card.className = 'atencion-card' + (esSeleccionada ? ' card-seleccionada' : '');
    card.setAttribute('data-id', cita.id);
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <small class="text-muted fw-bold d-block mb-1">
                    <i class="bi bi-person-badge"></i> Dr(a). ${medicoNombre}
                </small>
                <h6 class="fw-bold text-dark mb-1">
                    ${cita.motivoPrincipal}
                </h6>
                <span class="badge" style="background:#1a6e40; color:#fff;">
                    ● En consulta
                </span>
            </div>
            <i class="bi bi-chevron-right text-muted"></i>
        </div>
    `;

    listaEnAtencion.appendChild(card);
}

function conectarBotonesSeleccionarActivo() {
    document.querySelectorAll('.atencion-card').forEach(card => {
        card.addEventListener('click', function() {
            seleccionarPacienteActivo(this.getAttribute('data-id'));
        });
    });
}

// El usuario elige explícitamente a cuál paciente "en atención" quiere ver/editar
function seleccionarPacienteActivo(idCita) {
    const cita = ultimasCitasActivas.find(c => c.id === idCita);
    if (!cita) return;

    pacienteEnAtencionId = cita.id;
    mascotaActualId = cita.mascota ? cita.mascota.id : null;

    document.getElementById('panelVacio').style.display = 'none';
    document.getElementById('panelActivo').style.display = 'block';

    mostrarDatosPanelActivo(cita);
    resaltarCardSeleccionada(idCita);

    if (idCitaCargada !== cita.id) {
        idCitaCargada = cita.id;
        cargarConsultaActiva(cita.id);
    }
}

function mostrarDatosPanelActivo(cita) {
    document.getElementById('lblMotivoActivo').innerText = cita.motivoPrincipal;
    document.getElementById('lblHoraInicio').innerText = obtenerHoraInicio(cita.fechaHoraLlegada);
    document.getElementById('lblMedicoActivo').innerText = cita.veterinario ? cita.veterinario.nombre : '--';
    document.getElementById('citaActivaId').value = cita.id;
    document.getElementById('mascotaActivaId').value = mascotaActualId || '';
}

function resaltarCardSeleccionada(idCita) {
    document.querySelectorAll('.atencion-card').forEach(card => {
        card.classList.toggle('card-seleccionada', card.getAttribute('data-id') === idCita);
    });
}

function obtenerHoraLlegada(fechaLlegada) {
    let fecha = fechaLlegada;

    if (Array.isArray(fecha)) {
        fecha = new Date(
            fecha[0],
            fecha[1] - 1,
            fecha[2],
            fecha[3] || 0,
            fecha[4] || 0
        );
    } else {
        fecha = new Date(fecha);
    }

    return fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerHoraInicio(fechaInicio) {
    let fecha = fechaInicio;

    if (Array.isArray(fecha)) {
        fecha = new Date();
    } else {
        fecha = new Date(fecha);
    }

    return fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Actualiza contadores y decide qué mostrar en el panel derecho
function actualizarPanelesConsulta(pacientesActivos, countEspera) {
    document.getElementById('contadorEspera').innerText = countEspera;
    document.getElementById('contadorAtencion').innerText = pacientesActivos.length;

    if (pacienteEnAtencionId) {
        const sigueActivo = pacientesActivos.find(c => c.id === pacienteEnAtencionId);
        if (sigueActivo) {
            // Refrescamos solo las etiquetas, sin tocar lo que el médico esté escribiendo
            mostrarDatosPanelActivo(sigueActivo);
            resaltarCardSeleccionada(pacienteEnAtencionId);
            return;
        }
        // El paciente ya no está EN_ATENCION (fue finalizado/cambiado en otra sesión)
        cerrarPanelActivo();
    }

    if (pacientesActivos.length === 0) {
        mostrarMensajeVacio('Seleccione un paciente de la cola de espera para iniciar la evaluación médica.');
    } else {
        mostrarMensajeVacio('Seleccione un paciente de la lista "En Atención" para continuar su evaluación.');
    }
}

function cerrarPanelActivo() {
    document.getElementById('panelVacio').style.display = 'block';
    document.getElementById('panelActivo').style.display = 'none';
    document.getElementById('formAnamnesis').reset();

    pacienteEnAtencionId = null;
    mascotaActualId = null;
    idCitaCargada = null;
}

function mostrarMensajeVacio(mensaje) {
    document.getElementById('panelVacio').style.display = 'block';
    document.getElementById('panelActivo').style.display = 'none';
    const msg = document.getElementById('msgPanelVacio');
    if (msg) msg.innerText = mensaje;
}

function conectarBotonesIniciarAtencion() {
    document.querySelectorAll('.btn-iniciar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            iniciarAtencion(this.getAttribute('data-id'));
        });
    });
}

// Ya no bloquea si hay otro paciente en curso: distintos médicos pueden atender en paralelo
function iniciarAtencion(idCita) {
    fetch(`${API_URL}/${idCita}/iniciar-atencion`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                idPendienteSeleccion = idCita;
                cargarTorreControl();
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo iniciar la atención.', 'error');
        });
}