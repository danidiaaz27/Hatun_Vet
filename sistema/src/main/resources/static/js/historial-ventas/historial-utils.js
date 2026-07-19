function formatearFechaVenta(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('es-PE') + ' ' +
        d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function renderEstadoVenta(data) {
    if (data === 'FACTURADO') return '<span class="badge bg-success">Facturado</span>';
    if (data === 'PENDIENTE_ENVIO') return '<span class="badge bg-warning text-dark">Pendiente de Envío</span>';
    if (data === 'ERROR_FACTURACION') return '<span class="badge bg-danger">Error de Facturación</span>';
    if (data === 'RECHAZADO_SUNAT') return '<span class="badge bg-danger">Rechazado por SUNAT</span>';
    if (data === 'ANULADO') return '<span class="badge bg-danger">Anulado</span>';
    if (data === 'NOTA_VENTA') return '<span class="badge bg-info">Nota de Venta</span>';
    return `<span class="badge bg-secondary">${data}</span>`;
}

function crearNombreArchivo(row) {
    return `${RUC_EMISOR}-${row.tipoComprobante}-${row.serie}-${row.correlativo}`;
}

function crearLinksComprobante(row) {
    const baseUrl = 'https://miapi.cloud/apifact/documents';
    const nombreArchivo = crearNombreArchivo(row);
    return {
        ticket: `${baseUrl}/pdf/${RUC_EMISOR}/invoice/ticket/${nombreArchivo}.pdf`,
        a4: `${baseUrl}/pdf/${RUC_EMISOR}/invoice/a4/${nombreArchivo}.pdf`,
        xml: `${baseUrl}/xml/${RUC_EMISOR}/signed/${nombreArchivo}.XML`
    };
}