const selectMedico = document.getElementById('selectMedico');
const seccionTablas = document.getElementById('seccionTablas');
const btnGroupAcciones = document.getElementById('btnGroupAcciones');
const seleccionVaciaAlert = document.getElementById('seleccionVaciaAlert');

const modalHorario = new bootstrap.Modal(
    document.getElementById('modalHorario')
);

const modalPermiso = new bootstrap.Modal(
    document.getElementById('modalPermiso')
);

document.addEventListener('DOMContentLoaded', () => {

    cargarVeterinarios();

    selectMedico.addEventListener('change', manejarCambioVeterinario);

    inicializarFormularioHorario();

    inicializarFormularioPermiso();

});