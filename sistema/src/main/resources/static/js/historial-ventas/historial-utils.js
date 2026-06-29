function formatearFechaVenta(data) {
    if (!data) return '';

    const d = new Date(data);

    return d.toLocaleDateString('es-PE') + ' ' +
        d.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
}

function renderEstadoVenta(data) {
    if (data === 'FACTURADO') {
        return '<span class="badge bg-success">Facturado</span>';
    }

    if (data === 'ANULADO') {
        return '<span class="badge bg-danger">Anulado</span>';
    }

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