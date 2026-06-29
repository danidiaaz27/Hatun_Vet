function iniciarHistorialConsulta() {
    document.getElementById('btnVerHistorial')
        .addEventListener('click', verHistorialConsulta);
}

function verHistorialConsulta() {
    if (!mascotaActualId) {
        mascotaActualId = document.getElementById('mascotaActivaId').value;
    }

    fetch(`${API_URL}/historial/${mascotaActualId}`)
        .then(r => r.json())
        .then(historial => renderHistorialConsulta(historial));
}

function renderHistorialConsulta(historial) {
    const contenedor = document.getElementById('timelineHistorial');
    contenedor.innerHTML = '';

    if (historial.length === 0) {
        contenedor.innerHTML =
            '<div class="text-center text-muted p-4">No hay atenciones previas registradas para esta mascota.</div>';

        modalHistorial.show();
        return;
    }

    contenedor.innerHTML = crearTimelineHistorial(historial);
    modalHistorial.show();
}

function crearTimelineHistorial(historial) {
    let html =
        '<div class="border-start border-3 border-primary ms-3 ps-4 position-relative">';

    historial.forEach(h => {
        html += crearItemHistorial(h);
    });

    html += '</div>';

    return html;
}

function crearItemHistorial(h) {
    const fecha = new Date(h.fecha).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `
        <div class="mb-4 position-relative">
            <span class="position-absolute translate-middle p-2 bg-primary border border-light border-3 rounded-circle"
                style="left: -1.6rem; top: 0.2rem;">
            </span>

            <div class="card shadow-sm border-0">
                <div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-2">
                    <strong class="text-primary">
                        <i class="bi bi-calendar-event me-1"></i>
                        ${fecha}
                    </strong>

                    <small class="text-muted">
                        <i class="bi bi-person-badge"></i>
                        Dr/a. ${h.medico}
                    </small>
                </div>

                <div class="card-body py-2">
                    <div class="d-flex gap-3 mb-2 small text-danger fw-bold border-bottom pb-2">
                        <span>Peso: ${h.peso} kg</span>
                        <span>Temp: ${h.temp} °C</span>
                    </div>

                    <p class="mb-1 small">
                        <strong>Síntomas:</strong> ${h.sintomas}
                    </p>

                    <p class="mb-1 small">
                        <strong>Diagnóstico:</strong> ${h.diagnostico}
                    </p>

                    <p class="mb-0 small">
                        <strong>Tratamiento:</strong> ${h.tratamiento}
                    </p>
                </div>
            </div>
        </div>
    `;
}