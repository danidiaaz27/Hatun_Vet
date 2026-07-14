function iniciarAutocomplete() {
    const buscarDuenoInput = document.getElementById('buscarDuenoInput');
    const resultados = document.getElementById('resultadosBusquedaDueno');
    const btnLimpiar = document.getElementById('btnLimpiarDueno');
    buscarDuenoInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        resultados.innerHTML = '';
        if (query.length < 2) {
            resultados.style.display = 'none';
            return;
        }
        const filtrados = clientesList.filter(c =>
            c.nombreCompleto.toLowerCase().includes(query) ||
            c.numeroDocumento.includes(query)
        );
        mostrarResultadosDueno(filtrados, resultados);
    });
    document.addEventListener('click', function(e) {
        if (e.target !== buscarDuenoInput && e.target !== resultados) {
            resultados.style.display = 'none';
        }
    });
    btnLimpiar.addEventListener('click', limpiarSeleccionPropietario);
}
function mostrarResultadosDueno(filtrados, resultados) {
    if (filtrados.length === 0) {
        resultados.innerHTML =
            '<li class="autocomplete-suggestion-item text-muted">No se encontraron resultados</li>';
        resultados.style.display = 'block';
        return;
    }
    filtrados.forEach(cliente => {
        const li = document.createElement('li');
        li.className = 'autocomplete-suggestion-item';
        li.innerHTML = `<strong>${cliente.nombreCompleto}</strong>
            <span class="text-muted small">(${cliente.numeroDocumento})</span>`;

        li.addEventListener('click', function() {
            seleccionarPropietario(cliente);
        });

        resultados.appendChild(li);
    });

    resultados.style.display = 'block';
}
function seleccionarPropietario(cliente) {
    const buscarDuenoInput = document.getElementById('buscarDuenoInput');
    const duenoId = document.getElementById('duenoIdSeleccionado');
    const btnLimpiar = document.getElementById('btnLimpiarDueno');
    const resultados = document.getElementById('resultadosBusquedaDueno');
    buscarDuenoInput.value = `${cliente.nombreCompleto} (${cliente.numeroDocumento})`;
    duenoId.value = cliente.id;
    buscarDuenoInput.disabled = true;
    btnLimpiar.style.display = 'block';
    resultados.style.display = 'none';
    cargarMascotasCliente(cliente.id);
}
function limpiarSeleccionPropietario() {
    const buscarDuenoInput = document.getElementById('buscarDuenoInput');
    const duenoId = document.getElementById('duenoIdSeleccionado');
    const btnLimpiar = document.getElementById('btnLimpiarDueno');
    const mascotaSelect = document.getElementById('mascotaId');
    buscarDuenoInput.value = '';
    buscarDuenoInput.disabled = false;
    duenoId.value = '';
    btnLimpiar.style.display = 'none';
    mascotaSelect.innerHTML = '<option value="">-- Primero busque un dueño --</option>';
    mascotaSelect.disabled = true;
}
function cargarMascotasCliente(clienteId, mascotaIdSeleccionar = null) {
    const mascotaSelect = document.getElementById('mascotaId');
    mascotaSelect.innerHTML = '<option value="">Cargando mascotas...</option>';
    mascotaSelect.disabled = true;
    fetch(`/mascotas/api/cliente/${clienteId}`)
        .then(r => r.json())
        .then(res => {
            mascotaSelect.innerHTML = '';
            if (res.success && res.data && res.data.length > 0) {
                res.data.forEach(m => {
                    const sel = mascotaIdSeleccionar && m.id == mascotaIdSeleccionar
                        ? 'selected'
                        : '';
                    mascotaSelect.innerHTML += `<option value="${m.id}" ${sel}>
                        ${m.nombre} (${m.especie} - ${m.raza || 'Sin raza'})
                    </option>`;
                });
                mascotaSelect.disabled = false;
            } else {
                mascotaSelect.innerHTML =
                    '<option value="">El cliente no tiene mascotas registradas</option>';
                mascotaSelect.disabled = true;
            }
        })
        .catch(err => {
            console.error(err);
            mascotaSelect.innerHTML = '<option value="">Error al cargar mascotas</option>';
            mascotaSelect.disabled = true;
        });
}