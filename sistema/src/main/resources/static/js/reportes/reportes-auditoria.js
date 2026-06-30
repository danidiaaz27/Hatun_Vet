function cargarAuditoriaClinica() {
    fetch('/reportes/api/rentabilidad-clinica')
        .then(r => r.json())
        .then(res => pintarAuditoria(res))
        .catch(error => mostrarErrorAuditoria(error));
}

function pintarAuditoria(res) {
    const tbody = $('#tbodyAuditoriaInsumos');
    tbody.empty();

    if (!res.success || !res.data.detalles.length) {
        tbody.html(crearMensajeAuditoriaVacia());
        return;
    }

    res.data.detalles.forEach(item =>
        tbody.append(crearFilaAuditoria(item))
    );
}

function crearFilaAuditoria(item) {
    const clase = item.utilidad >= 0
        ? 'text-success'
        : 'text-danger fw-bold';

    return `
        <tr>
            <td class="ps-3">
                <span class="fw-bold text-secondary">
                    <i class="bi bi-github text-primary me-1"></i>
                    ${item.mascota}
                </span>
            </td>

            <td>
                <span class="d-inline-block text-truncate"
                      style="max-width:280px;"
                      title="${item.insumo}">
                    ${item.insumo}
                </span>
            </td>

            <td class="text-center fw-semibold">${item.cantidad}</td>

            <td class="text-end text-dark">
                ${formatearMoneda(item.precioCobrado)}
            </td>

            <td class="text-end text-muted">
                ${formatearMoneda(item.cogs)}
            </td>

            <td class="text-end pe-3 ${clase}">
                ${formatearMoneda(item.utilidad)}
            </td>
        </tr>
    `;
}

function crearMensajeAuditoriaVacia() {
    return `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <i class="bi bi-info-circle me-2"></i>
                No se registran movimientos ni consumos de insumos clínicos en este periodo.
            </td>
        </tr>
    `;
}

function mostrarErrorAuditoria(error) {
    console.error('Error de red en Auditoría:', error);

    $('#tbodyAuditoriaInsumos').html(`
        <tr>
            <td colspan="6" class="text-center text-danger py-4">
                <i class="bi bi-exclamation-octagon-fill me-2"></i>
                Error al conectar con la API de auditoría.
            </td>
        </tr>
    `);
}