$(document).ready(function() {

    // Poner la fecha actual en el header
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $('#fechaActual').text(new Date().toLocaleDateString('es-PE', opcionesFecha));

    // Formateador de moneda
    const formatoMoneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

    // Llamar a la API Centralizada que creamos en Java
    fetch('/reportes/api/dashboard')
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                // 1. PINTAR KPIs (Tarjetas Superiores)
                $('#kpiIngresosHoy').text(formatoMoneda.format(res.kpis.ingresosHoy));
                $('#kpiIngresosMes').text(formatoMoneda.format(res.kpis.ingresosMes));
                $('#kpiTotalVentas').text(res.kpis.totalVentasMes);
                $('#kpiTotalServicios').text(res.kpis.totalServiciosMes);

                // 2. PINTAR ALERTA DE STOCK (Petshop)
                const tbodyStock = $('#tbodyStockCritico');
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

                // 3. DIBUJAR GRÁFICOS (Peluquería)
                dibujarGraficoEspecies(res.peluqueria.porEspecie);
                dibujarGraficoServicios(res.peluqueria.porServicio);

            } else {
                console.error("Error al cargar el Dashboard:", res.message);
                alert("Ocurrió un error al cargar los datos del Dashboard.");
            }
        })
        .catch(error => console.error("Error de red:", error));

    // --- Funciones para Chart.js ---

    function dibujarGraficoEspecies(datosEspecie) {
        // datosEspecie llega como [["Perro", 10], ["Gato", 5]]
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
        // datosServicio llega como [["Baño Estándar", 8], ["Solo Corte", 4]]
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
                    backgroundColor: 'rgba(111, 66, 193, 0.7)', // Morado HatunVet
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
                    legend: { display: false } // Ocultamos la leyenda superior para que se vea más limpio
                }
            }
        });
    }

});