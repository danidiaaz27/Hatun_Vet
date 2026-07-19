function cargarDashboard() {
    fetch('/reportes/api/dashboard')
        .then(r => r.json())
        .then(res => {
            if (!res.success) {
                mostrarError('Ocurrió un error al cargar el Dashboard.');
                return;
            }

            pintarKPIs(res.kpis);
            pintarStockCritico(res.petshop.stockCritico);
            pintarTopProductos(res.topProductos || []);

            dibujarGraficoEspecies(res.peluqueria.porEspecie);
            dibujarGraficoServicios(res.peluqueria.porServicio);
        })
        .catch(err =>
            console.error('Error de red en Dashboard:', err)
        );
}

function pintarKPIs(kpis) {
    $('#kpiIngresosHoy').text(formatearMoneda(kpis.ingresosHoy));
    $('#kpiIngresosMes').text(formatearMoneda(kpis.ingresosMes));
    $('#kpiTotalVentas').text(kpis.totalVentasMes);
    $('#kpiTotalServicios').text(kpis.totalServiciosMes);
}

function pintarStockCritico(stockCritico) {
    const tbody = $('#tbodyStockCritico');
    tbody.empty();

    if (stockCritico.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="2" class="text-center text-success py-4">
                    <i class="bi bi-check-circle-fill fs-4 d-block mb-2"></i>
                    ¡Todo en orden! No hay stock crítico.
                </td>
            </tr>
        `);
        return;
    }

    stockCritico.forEach(p => tbody.append(crearFilaStockCritico(p)));
}

function crearFilaStockCritico(prod) {
    const badge = prod.stock === 0 ? 'bg-dark' : 'bg-danger';

    return `
        <tr>
            <td class="ps-3">
                <small class="text-muted d-block">${prod.codigo}</small>
                <span class="fw-bold">${prod.nombre}</span>
            </td>

            <td class="text-center pe-3 align-middle">
                <span class="badge ${badge} fs-6">${prod.stock}</span>
            </td>
        </tr>
    `;
}

// NUEVO: Top 5 productos más vendidos (llega como lista de [nombre, cantidad])
function pintarTopProductos(top) {
    const cont = $('#listaTopProductos');
    cont.empty();

    if (!top.length) {
        cont.html('<div class="text-center text-muted py-4">Aún no hay ventas registradas.</div>');
        return;
    }

    top.forEach((item, i) => {
        cont.append(`
            <div class="top-producto-row">
                <div class="d-flex align-items-center text-truncate" style="max-width:70%;">
                    <span class="top-producto-rank">${i + 1}</span>
                    <span class="text-truncate">${item[0]}</span>
                </div>
                <span class="fw-bold text-primary">${item[1]} und.</span>
            </div>
        `);
    });
}