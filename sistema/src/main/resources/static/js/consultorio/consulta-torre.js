function cargarTorreControl() {
    fetch(API_URL)
        .then(r => r.json())
        .then(citas => {
            const listaEspera = document.getElementById('listaEspera');

            listaEspera.innerHTML = '';

            let countEspera = 0;
            let hayPacienteActivo = false;

            citas.forEach(cita => {
                if (cita.estado === 'EN_ESPERA') {
                    countEspera++;
                    renderPacienteEspera(cita, listaEspera);
                }

                if (cita.estado === 'EN_ATENCION') {
                    hayPacienteActivo = true;
                    procesarPacienteActivo(cita);
                }
            });

            actualizarPanelesConsulta(hayPacienteActivo, countEspera);
            conectarBotonesIniciarAtencion();
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

function procesarPacienteActivo(cita) {
    if (pacienteEnAtencionId !== cita.id) {
        pacienteEnAtencionId = cita.id;
        mascotaActualId = cita.mascota?.id;
    }

    document.getElementById('lblMotivoActivo').innerText =
        cita.motivoPrincipal;

    document.getElementById('lblHoraInicio').innerText =
        obtenerHoraInicio(cita.fechaHoraLlegada);

    document.getElementById('citaActivaId').value = cita.id;
    document.getElementById('mascotaActivaId').value = mascotaActualId;

    if (idCitaCargada !== cita.id) {
        idCitaCargada = cita.id;
        cargarConsultaActiva(cita.id);
    }
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

function actualizarPanelesConsulta(hayPacienteActivo, countEspera) {
    document.getElementById('contadorEspera').innerText = countEspera;

    if (hayPacienteActivo) {
        document.getElementById('panelVacio').style.display = 'none';
        document.getElementById('panelActivo').style.display = 'block';
        return;
    }

    document.getElementById('panelVacio').style.display = 'block';
    document.getElementById('panelActivo').style.display = 'none';
    document.getElementById('formAnamnesis').reset();

    pacienteEnAtencionId = null;
    mascotaActualId = null;
    idCitaCargada = null;
}

function conectarBotonesIniciarAtencion() {
    document.querySelectorAll('.btn-iniciar').forEach(btn => {
        btn.addEventListener('click', function() {
            iniciarAtencion(this.getAttribute('data-id'));
        });
    });
}

function iniciarAtencion(idCita) {
    if (pacienteEnAtencionId) {
        Swal.fire(
            'Consultorio Ocupado',
            'Finalice la consulta actual antes de llamar a un nuevo paciente.',
            'warning'
        );
        return;
    }

    fetch(`${API_URL}/${idCita}/iniciar-atencion`, {
        method: 'POST'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) cargarTorreControl();
            else Swal.fire('Error', res.message, 'error');
        });
}