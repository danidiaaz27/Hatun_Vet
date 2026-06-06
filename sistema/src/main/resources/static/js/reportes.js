$(document).ready(function() {

    // Poner la fecha actual en el header
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $('#fechaActual').text(new Date().toLocaleDateString('es-PE', opcionesFecha));

    // Formateador de moneda (Estándar Sol Peruano)
    const formatoMoneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

    // ==========================================
    // 1. LLAMADA A LA API CENTRALIZADA (DASHBOARD)
    // ==========================================
    fetch('/reportes/api/dashboard')
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                // PINTAR KPIs (Tarjetas Superiores)
                $('#kpiIngresosHoy').text(formatoMoneda.format(res.kpis.ingresosHoy));
                $('#kpiIngresosMes').text(formatoMoneda.format(res.kpis.ingresosMes));
                $('#kpiTotalVentas').text(res.kpis.totalVentasMes);
                $('#kpiTotalServicios').text(res.kpis.totalServiciosMes);

                // PINTAR ALERTA DE STOCK (Petshop)
                const tbodyStock = $('#tbodyStockCritico');
                tbodyStock.empty(); // Limpiar estático
                
                if (res.petshop.stockCritico.length === 0) {
                    tbodyStock.html('<tr><td colspan="2" class="text-center text-success py-4"><i class="bi bi-check-circle-fill fs-4 d-block mb-2"></i>¡Todo en orden! No hay stock crítico.</td></tr>');
                } else {
                    res.petshop.stockCritico.forEach(prod => {
                        let badgeColor = prod.stock === 0 ? 'bg-dark' : 'bg-danger';
                        tbodyStock.append(`
                            <tr>
                                <td class="ps-3"><small class="text-muted d-block">${prod.codigo}</small><span class="fw-bold">${prod.nombre}</span></td>
                                <td class="text-center pe-3 align-middle"><span class="badge ${badgeColor} fs-6">${prod.stock}</span></td>
                            </tr>
                        `);
                    });
                }

                // DIBUJAR GRÁFICOS (Peluquería)
                dibujarGraficoEspecies(res.peluqueria.porEspecie);
                dibujarGraficoServicios(res.peluqueria.porServicio);

            } else {
                console.error("Error al cargar el Dashboard:", res.message);
                alert("Ocurrió un error al cargar los datos del Dashboard.");
            }
        })
        .catch(error => console.error("Error de red en Dashboard:", error));


    // ==========================================
    // 2. CONSUMIR ENDPOINT DE RENTABILIDAD Y AUDITORÍA
    // ==========================================
    fetch('/reportes/api/rentabilidad-clinica')
        .then(response => response.json())
        .then(res => {
            const tbodyAuditoria = $('#tbodyAuditoriaInsumos');
            tbodyAuditoria.empty(); // Remover el mensaje de "Cargando..."

            // Verificamos que la respuesta sea exitosa y contenga la lista de detalles
            if (res.success && res.data.detalles && res.data.detalles.length > 0) {
                res.data.detalles.forEach(item => {
                    // Estilo de color automático si la utilidad es negativa (alerta de pérdida)
                    let utilidadClass = item.utilidad >= 0 ? 'text-success' : 'text-danger fw-bold';
                    
                    tbodyAuditoria.append(`
                        <tr>
                            <td class="ps-3">
                                <span class="fw-bold text-secondary"><i class="bi bi-github text-primary me-1"></i>${item.mascota}</span>
                            </td>
                            <td>
                                <span class="d-inline-block text-truncate" style="max-width: 280px;" title="${item.insumo}">
                                    ${item.insumo}
                                </span>
                            </td>
                            <td class="text-center fw-semibold">${item.cantidad}</td>
                            <td class="text-end text-dark">${formatoMoneda.format(item.precioCobrado)}</td>
                            <td class="text-end text-muted">${formatoMoneda.format(item.cogs)}</td>
                            <td class="text-end pe-3 ${utilidadClass}">${formatoMoneda.format(item.utilidad)}</td>
                        </tr>
                    `);
                });
            } else {
                tbodyAuditoria.html('<tr><td colspan="6" class="text-center text-muted py-4"><i class="bi bi-info-circle me-2"></i>No se registran movimientos ni consumos de insumos clínicos en este periodo.</td></tr>');
            }
        })
        .catch(error => {
            console.error("Error de red en Auditoría:", error);
            $('#tbodyAuditoriaInsumos').html('<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-octagon-fill me-2"></i>Error al conectar con la API de auditoría.</td></tr>');
        });


    // ==========================================
    // NOTA: MOTORES DE RENDERIZADO (CHART.JS)
    // ==========================================
    function dibujarGraficoEspecies(datosEspecie) {
        const etiquetas = datosEspecie.map(item => item[0]);
        const valores = datosEspecie.map(item => item[1]);

        const ctx = document.getElementById('chartEspecies').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: etiquetas,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#0d6efd', '#fd7e14', '#20c997', '#6f42c1'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    function dibujarGraficoServicios(datosServicio) {
        const etiquetas = datosServicio.map(item => item[0]);
        const valores = datosServicio.map(item => item[1]);

        const ctx = document.getElementById('chartServicios').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Cantidad de Servicios',
                    data: valores,
                    backgroundColor: 'rgba(111, 66, 193, 0.7)',
                    borderColor: '#6f42c1',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});