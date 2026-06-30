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
        options: obtenerOpcionesGraficoCircular()
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
        options: obtenerOpcionesGraficoBarras()
    });
}

function obtenerOpcionesGraficoCircular() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
}

function obtenerOpcionesGraficoBarras() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };
}