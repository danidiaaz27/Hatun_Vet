function iniciarFiltrosHistorial() {
    registrarFiltroFechaHistorial();

    $('#filtroFechaInicio, #filtroFechaFin').on('change', function() {
        dataTable.draw();
    });

    $('#btnLimpiarFiltros').click(limpiarFiltrosHistorial);
}

function registrarFiltroFechaHistorial() {
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        const min = $('#filtroFechaInicio').val();
        const max = $('#filtroFechaFin').val();
        const rowData = ventasData[dataIndex];

        if (!rowData) return true;

        const fechaVenta = rowData.fechaEmision.split('T')[0];

        if (min && fechaVenta < min) return false;
        if (max && fechaVenta > max) return false;

        return true;
    });
}

function limpiarFiltrosHistorial() {
    $('#filtroFechaInicio').val('');
    $('#filtroFechaFin').val('');
    dataTable.draw();
}