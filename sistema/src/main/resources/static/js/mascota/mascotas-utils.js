function formatDate(value) {
    if (!value) return '';

    return new Date(value).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(value) {
    if (!value) return '';

    return new Date(value).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function normalizarTexto(texto) {
    return (texto || '')
        .toString()
        .trim();
}

function setLabelDuenoSeleccionado(cliente) {
    const badge = $('#badgeClienteVinculado');

    if (!cliente) {
        $('#lblDuenoSeleccionado').text('Ninguno');
        $('#lblDuenoDetalle').text(
            'Use el selector superior para vincular un dueño existente.'
        );
        badge.addClass('d-none');
        return;
    }

    const descripcion =
        `${cliente.nombreCompleto || ''} · ${cliente.numeroDocumento || ''}`
            .trim();

    $('#lblDuenoSeleccionado').text(cliente.nombreCompleto || 'Cliente');
    $('#lblDuenoDetalle').text(descripcion || 'Cliente vinculado');
    badge.removeClass('d-none');
}