function obtenerBadgeTipo(esIngreso) {
    return esIngreso
        ? '<span class="text-success fw-bold"><i class="bi bi-caret-up-fill"></i> INGRESO</span>'
        : '<span class="text-danger fw-bold"><i class="bi bi-caret-down-fill"></i> EGRESO</span>';
}

function obtenerBadgeCanal(medioPago) {
    const clase = medioPago === 'EFECTIVO'
        ? 'bg-primary-subtle text-primary'
        : 'bg-info-subtle text-info';

    return `<span class="badge ${clase}">
        <i class="bi bi-cash"></i> ${medioPago}
    </span>`;
}

function actualizarKPIs(t, cantidad) {
    $('#lblTotalIngresos').text(`S/ ${t.ingresos.toFixed(2)}`);
    $('#lblIngresosEfectivo').text(`S/ ${t.ingresosEfectivo.toFixed(2)}`);
    $('#lblIngresosOnline').text(`S/ ${t.ingresosOnline.toFixed(2)}`);
    $('#lblTotalEgresos').text(`S/ ${t.egresos.toFixed(2)}`);

    $('#countIngresos').text(`${t.cIngresos} operaciones`);
    $('#countIngresosEfectivo').text(`${t.cEfectivo} cobros`);
    $('#countIngresosOnline').text(`${t.cOnline} cobros`);
    $('#countEgresos').text(`${t.cEgresos} operaciones`);
    $('#badgeRegistros').text(`${cantidad} registros`);
}

function actualizarEcuacion(t) {
    const esperado = montoAperturaSesion + t.ingresos - t.egresos;

    $('#eqApertura').text(`S/ ${montoAperturaSesion.toFixed(2)}`);
    $('#eqIngresos').text(`S/ ${t.ingresos.toFixed(2)}`);
    $('#eqEgresos').text(`S/ ${t.egresos.toFixed(2)}`);
    $('#eqBalance').text(`S/ ${esperado.toFixed(2)}`);

    $('#lblMontoEsperado').text(`S/ ${esperado.toFixed(2)}`);
    $('#lblMontoEsperadoModal').text(`S/ ${esperado.toFixed(2)}`);
}