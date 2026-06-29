function procesarYRenderizar(movimientos) {
    const totales = calcularTotales(movimientos);

    tablaCaja.clear();

    movimientos.forEach(m => agregarFilaMovimiento(m));

    tablaCaja.draw();

    actualizarKPIs(totales, movimientos.length);
    actualizarEcuacion(totales);
    $('#lblHoraActualizacion').text(new Date().toLocaleTimeString('es-PE'));
}

function calcularTotales(movimientos) {
    const t = {
        ingresos: 0,
        egresos: 0,
        ingresosEfectivo: 0,
        ingresosOnline: 0,
        cIngresos: 0,
        cEgresos: 0,
        cEfectivo: 0,
        cOnline: 0
    };

    movimientos.forEach(m => {
        const monto = parseFloat(m.monto);
        const esIngreso = m.tipo === 'INGRESO';

        if (esIngreso) {
            t.ingresos += monto;
            t.cIngresos++;

            if (m.medioPago === 'EFECTIVO') {
                t.ingresosEfectivo += monto;
                t.cEfectivo++;
            } else {
                t.ingresosOnline += monto;
                t.cOnline++;
            }
        } else {
            t.egresos += monto;
            t.cEgresos++;
        }
    });

    return t;
}

function agregarFilaMovimiento(m) {
    const monto = parseFloat(m.monto);
    const esIngreso = m.tipo === 'INGRESO';
    const f = parsearFecha(m.fechaMovimiento).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });

    tablaCaja.row.add([
        `<small class="text-muted">${f}</small>`,
        obtenerBadgeTipo(esIngreso),
        `<span class="fw-semibold text-dark">${m.descripcion}</span>`,
        obtenerBadgeCanal(m.medioPago),
        `<div class="text-end fw-bold ${esIngreso ? 'text-success' : 'text-danger'}">
            S/ ${monto.toFixed(2)}
        </div>`
    ]);
}