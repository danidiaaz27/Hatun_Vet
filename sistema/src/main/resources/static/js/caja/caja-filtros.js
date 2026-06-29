function iniciarFiltrosCaja() {
    $('#btnBuscar').click(buscarMovimientosCaja);
    $('#btnLimpiar, #btnActualizar').click(limpiarFiltrosCaja);
}

function buscarMovimientosCaja() {
    const desde = $('#filtroDesde').val();
    const hasta = $('#filtroHasta').val();
    const tipo = $('#filtroTipo').val();
    const medio = $('#filtroMedio').val();

    fetch(`${API_URL}/filtrar?fechaDesde=${desde}&fechaHasta=${hasta}&tipo=${tipo}&medioPago=${medio}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                procesarYRenderizar(res.data);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        });
}

function limpiarFiltrosCaja() {
    $('#filtroDesde, #filtroHasta, #filtroTipo, #filtroMedio').val('');
    verificarEstadoCaja();
}