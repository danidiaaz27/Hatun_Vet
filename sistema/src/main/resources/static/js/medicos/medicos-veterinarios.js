function cargarVeterinarios() {
    fetch('/usuarios/api/veterinarios')
        .then(r => r.json())
        .then(res => {
            selectMedico.innerHTML =
                '<option value="">-- Seleccione un médico --</option>';

            if (res.success && res.data) {
                res.data.forEach(agregarVeterinarioOption);
            }
        })
        .catch(err =>
            console.error('Error al cargar médicos:', err)
        );
}

function agregarVeterinarioOption(medico) {
    selectMedico.innerHTML += `
        <option value="${medico.id}">
            Dr(a). ${medico.nombre}
        </option>
    `;
}

function manejarCambioVeterinario() {
    const vetId = this.value;

    if (!vetId) {
        ocultarPanelVeterinario();
        return;
    }

    mostrarPanelVeterinario();
    cargarHorarios(vetId);
    cargarPermisos(vetId);
}

function ocultarPanelVeterinario() {
    seccionTablas.style.display = 'none';
    btnGroupAcciones.setAttribute('style', 'display: none !important;');
    seleccionVaciaAlert.style.display = 'block';
}

function mostrarPanelVeterinario() {
    seccionTablas.style.display = 'block';
    btnGroupAcciones.setAttribute('style', 'display: flex !important;');
    seleccionVaciaAlert.style.display = 'none';
}