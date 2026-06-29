function iniciarKardexInventario() {
    window.abrirModalKardex = abrirModalKardex;
}

function abrirModalKardex(idProducto) {
    const tbody = $('#tablaKardex tbody');

    tbody.html(`
        <tr>
            <td colspan="5" class="text-center py-4">
                <span class="spinner-border text-primary"></span>
                Cargando...
            </td>
        </tr>
    `);

    modalKardex.show();

    fetch(`${API_URL}/kardex/${idProducto}`)
        .then(r => r.json())
        .then(res => renderKardex(res, tbody));
}

function renderKardex(res, tbody) {
    tbody.empty();

    if (res.success && res.data.length > 0) {
        res.data.forEach(mov => {
            tbody.append(crearFilaKardex(mov));
        });
        return;
    }

    tbody.html(`
        <tr>
            <td colspan="5" class="text-center text-muted py-4">
                No hay movimientos registrados.
            </td>
        </tr>
    `);
}

function crearFilaKardex(mov) {
    const fecha = formatearFechaKardex(mov.fechaRegistro);
    const cantidad = formatearCantidadKardex(mov.cantidad);

    return `
        <tr>
            <td>${fecha}</td>
            <td>
                <span style="font-size:12px;font-weight:600;">
                    ${mov.tipoMovimiento}
                </span>
            </td>
            <td class="text-center">
                <span style="font-weight:800;color:${cantidad.color};">
                    ${cantidad.texto}
                </span>
            </td>
            <td style="font-size:12px;color:#6b7a99;">
                ${mov.motivo || '—'}
            </td>
            <td style="font-size:12px;color:#6b7a99;">
                ${mov.responsable}
            </td>
        </tr>
    `;
}

function formatearFechaKardex(fechaRegistro) {
    const f = new Date(fechaRegistro);

    return `
        ${f.toLocaleDateString('es-PE')}
        <br>
        <small style="color:#8a9bc0;">
            ${f.toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
            })}
        </small>
    `;
}

function formatearCantidadKardex(cantidad) {
    const esPositivo = cantidad > 0;

    return {
        texto: esPositivo ? `+${cantidad}` : `${cantidad}`,
        color: esPositivo ? '#1a6e40' : '#b71c1c'
    };
}