function cargarMedicos() {
    fetch('/usuarios/api/veterinarios')
        .then(r => r.json())
        .then(res => {
            const select = document.getElementById('medicoId');
            select.innerHTML = '<option value="">-- Seleccione un Médico --</option>';

            if (res.success && res.data) {
                res.data.forEach(med => {
                    select.innerHTML += `<option value="${med.id}">Dr(a). ${med.nombre}</option>`;
                });
            } else {
                select.innerHTML = '<option value="">Error al cargar médicos</option>';
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('medicoId').innerHTML =
                '<option value="">Error al cargar médicos</option>';
        });
}

function cargarClientes() {
    fetch('/clientes/api/listar')
        .then(r => r.json())
        .then(res => {
            if (res.data) clientesList = res.data;
        })
        .catch(err => console.error("Error al precargar clientes:", err));
}