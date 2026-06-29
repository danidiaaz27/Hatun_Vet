function renderResultadosMascota(lista) {
    const panel = $('#panelResultadosMascota');
    panel.empty();

    if (!lista.length) {
        panel.append(
            '<div class="list-group-item text-muted small text-center py-3">No se encontraron mascotas activas</div>'
        );
        panel.removeClass('d-none');
        return;
    }

    lista.forEach(mascota => renderMascotaResultado(mascota, panel));
    panel.removeClass('d-none');
}

function renderMascotaResultado(mascota, panel) {
    const cliente = mascota.cliente;

    const dueno = cliente
        ? `${cliente.nombreCompleto || ''} · ${cliente.numeroDocumento || ''}`
        : 'Sin dueño vinculado';

    panel.append(`
        <button type="button"
            class="list-group-item list-group-item-action mascota-result-item"
            data-id="${mascota.id}">
            <div class="d-flex align-items-center gap-3">
                <div class="avatar-pill-sm">
                    ${(mascota.nombre || '?').charAt(0).toUpperCase()}
                </div>

                <div class="text-start">
                    <div class="fw-bold">
                        ${mascota.nombre || ''}
                        <span class="text-muted fw-normal">
                            #${mascota.id}
                        </span>
                    </div>

                    <small class="text-muted">
                        ${mascota.especie || 'Sin especie'}
                        ·
                        ${mascota.raza || 'Sin raza'}
                    </small>

                    <div class="small">
                        ${dueno}
                    </div>
                </div>
            </div>
        </button>
    `);
}