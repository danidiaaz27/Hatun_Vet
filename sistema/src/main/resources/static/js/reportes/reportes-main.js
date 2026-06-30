let formatoMoneda = null;

$(document).ready(function () {

    inicializarFechaActual();

    formatoMoneda = crearFormatoMoneda();

    cargarDashboard();

    cargarAuditoriaClinica();

});