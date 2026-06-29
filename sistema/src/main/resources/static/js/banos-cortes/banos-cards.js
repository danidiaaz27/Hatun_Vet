function renderCards() {
    const grid = $('#groomingGrid');
    grid.empty();
    const filtro = $('#filtroEstado').val();

    serviciosFiltrados = filtro
        ? todosLosServicios.filter(s => s.estado === filtro)
        : [...todosLosServicios];
    const total = serviciosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const pagina = serviciosFiltrados.slice(inicio, inicio + POR_PAGINA);
    const fin = Math.min(inicio + POR_PAGINA, total);
    $('#lblConteo').text(
        total > 0
            ? `Mostrando ${inicio + 1} a ${fin} de ${total} registros`
            : 'Sin registros'
    );
    $('#btnPagActual').text(paginaActual);
    $('#btnPrev').prop('disabled', paginaActual <= 1);
    $('#btnNext').prop('disabled', paginaActual >= totalPaginas);
    if (pagina.length === 0) {
        grid.append(`
            <div class="grooming-empty">
                <i class="bi bi-scissors"></i>
                No hay servicios registrados
            </div>
        `);
        return;
    }
    pagina.forEach(row => renderServicioCard(row, grid));
}
function renderServicioCard(row, grid) {
    const nombre = nombreMascotaFila(row);
    const especie = especieMascotaFila(row);
    const icono = iconoEspecie(especie);
    const avatarBg = colorEspecie(especie);
    const esPagado = row.estado === 'PAGADO';
    const acciones = obtenerAccionesServicio(row);
    grid.append(`
        <div class="grooming-card">
            <div class="grooming-card-header">
                <div class="mascota-avatar" style="background:${avatarBg};">${icono}</div>
                <div class="mascota-info">
                    <div class="mascota-nombre">${nombre}</div>
                    <div class="mascota-especie" style="color:${esPagado ? '#b45309' : '#1a6e40'};">
                        ${especie}
                    </div>
                </div>
                <div class="d-flex flex-column align-items-end gap-1">
                    <span class="grooming-fecha">${formatDateTime(row.fechaServicio)}</span>
                    ${badgeEstado(row.estado)}
                </div>
            </div>
            <div class="grooming-info-row">
                <span><i class="bi bi-person-badge"></i> Dueño:
                    <strong>${row.nombreDueno || '—'}</strong>
                </span>
                <span><i class="bi bi-card-text"></i> Doc: ${row.dniDueno || '—'}</span>
                <span><i class="bi bi-scissors"></i> Servicio: ${row.tipoServicio || '—'}</span>
            </div>

            ${acciones}
        </div>
    `);
}
function obtenerAccionesServicio(row) {
    if (row.estado === 'PAGADO') {
        return `
            <div class="grooming-card-actions">
                <button class="btn btn-outline-secondary" disabled>
                    <i class="bi bi-check2-all me-1"></i> Cobrado
                </button>
            </div>`;
    }
    if (row.estado === 'TERMINADO') {
        return `
            <div class="grooming-card-actions">
                <button class="btn btn-outline-primary w-100"
                    style="border-color: var(--vet-blue); color: var(--vet-blue);"
                    onclick="Swal.fire('En Caja', 'Este servicio ya está disponible en la lista de cobranza del Punto de Venta (POS).', 'info')">
                    <i class="bi bi-cash-coin me-1"></i> Enviar a Caja
                </button>
            </div>`;
    }
    if (row.estado === 'EN_PROCESO') {
        return `
            <div class="grooming-card-actions">
                <button class="btn text-white btn-cambiar-estado w-100"
                    style="background:#1a6e40;"
                    data-id="${row.id}" data-estado="TERMINADO">
                    <i class="bi bi-check-circle me-1"></i> Finalizar
                </button>
            </div>`;
    }
    return `
        <div class="grooming-card-actions">
            <button class="btn btn-outline-secondary btn-cambiar-estado"
                data-id="${row.id}" data-estado="EN_PROCESO">
                <i class="bi bi-play-fill me-1"></i> Iniciar
            </button>
            <button class="btn text-white btn-cambiar-estado"
                style="background:#1a6e40;"
                data-id="${row.id}" data-estado="TERMINADO">
                <i class="bi bi-check-circle me-1"></i> Finalizar
            </button>
        </div>`;
}