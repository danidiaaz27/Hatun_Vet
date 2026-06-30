function inicializarFormularioHorario() {
    document.getElementById('btnNuevoHorario')
        .addEventListener('click', abrirModalHorario);

    document.getElementById('formHorario')
        .addEventListener('submit', guardarHorario);
}

function inicializarFormularioPermiso() {
    document.getElementById('btnNuevoPermiso')
        .addEventListener('click', abrirModalPermiso);

    document.getElementById('formPermiso')
        .addEventListener('submit', guardarPermiso);
}

function abrirModalHorario() {
    document.getElementById('formHorario').reset();
    modalHorario.show();
}

function guardarHorario(e) {
    e.preventDefault();

    fetch('/medicos/api/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadHorario())
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalHorario.hide();
                Swal.fire('Guardado', res.message, 'success');
                cargarHorarios(selectMedico.value);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => console.error(err));
}

function crearPayloadHorario() {
    return {
        veterinario: { id: selectMedico.value },
        diaSemana: parseInt(document.getElementById('diaSemana').value),
        horaInicio: document.getElementById('horaInicio').value + ':00',
        horaFin: document.getElementById('horaFin').value + ':00'
    };
}

function abrirModalPermiso() {
    document.getElementById('formPermiso').reset();
    modalPermiso.show();
}

function guardarPermiso(e) {
    e.preventDefault();

    fetch('/medicos/api/permisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadPermiso())
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modalPermiso.hide();
                Swal.fire('Registrado', res.message, 'success');
                cargarPermisos(selectMedico.value);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => console.error(err));
}

function crearPayloadPermiso() {
    return {
        veterinario: { id: selectMedico.value },
        motivo: document.getElementById('motivo').value.trim(),
        fechaInicio: document.getElementById('fechaInicio').value + ':00',
        fechaFin: document.getElementById('fechaFin').value + ':00',
        activo: true
    };
}