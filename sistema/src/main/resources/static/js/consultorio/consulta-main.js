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

    cargarTorreControl();
    setInterval(cargarTorreControl, 10000);
});