const API_URL = '/api/citas';

let pacienteEnAtencionId = null;
let mascotaActualId = null;
let idCitaCargada = null;

let modalHistorial = null;
let modalJalarInsumo = null;

let listaProductosInsumos = [];

document.addEventListener('DOMContentLoaded', function() {
    modalHistorial = new bootstrap.Modal(
        document.getElementById('modalHistorial')
    );

    modalJalarInsumo = new bootstrap.Modal(
        document.getElementById('modalJalarInsumo')
    );

    iniciarFormularioAnamnesis();
    iniciarHistorialConsulta();
    iniciarModuloInsumos();
    iniciarUtilidadesConsultorio();

    cargarTorreControl();
    setInterval(cargarTorreControl, 10000);
});

// --- NUEVO: min/max de fechas para próxima cita/vacuna/desparasitación ---
function iniciarUtilidadesConsultorio() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    const maxFecha = new Date(hoy);
    maxFecha.setMonth(maxFecha.getMonth() + 3);
    const maxFechaStr = maxFecha.toISOString().split('T')[0];

    ['fechaProximaCita', 'fechaProximaVacuna', 'fechaProximaDesparasitacion']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute('min', hoyStr);
                el.setAttribute('max', maxFechaStr);
            }
        });
}