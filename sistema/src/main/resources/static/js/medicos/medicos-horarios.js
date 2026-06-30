function cargarHorarios(vetId) {
    const tbody = document.querySelector('#tablaHorarios tbody');
    const alertSin = document.getElementById('sinHorariosAlert');

    tbody.innerHTML =
        '<tr><td colspan="4" class="text-center text-muted">Cargando horarios...</td></tr>';
    alertSin.style.display = 'none';

    fetch(`/medicos/api/${vetId}/horarios`)
        .then(r => r.json())
        .then(data => renderHorarios(data, tbody, alertSin))
        .catch(err => {
            console.error(err);
            tbody.innerHTML =
                '<tr><td colspan="4" class="text-center text-danger">Error al cargar horarios</td></tr>';
        });
}

function renderHorarios(data, tbody, alertSin) {
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        alertSin.style.display = 'block';
        return;
    }

    data.sort((a, b) => a.diaSemana - b.diaSemana);
    data.forEach(h => tbody.appendChild(crearFilaHorario(h)));

    conectarBotonesEliminarHorario();
}

function crearFilaHorario(horario) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td class="fw-bold text-dark">
            ${diasSemanaMap[horario.diaSemana]}
        </td>
        <td>
            <span class="badge bg-light text-dark border">
                ${horario.horaInicio.substring(0, 5)}
            </span>
        </td>
        <td>
            <span class="badge bg-light text-dark border">
                ${horario.horaFin.substring(0, 5)}
            </span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-danger btn-eliminar-horario"
                data-id="${horario.id}">
                <i class="bi bi-trash3-fill"></i>
            </button>
        </td>
    `;

    return tr;
}

function conectarBotonesEliminarHorario() {
    document.querySelectorAll('.btn-eliminar-horario').forEach(btn => {
        btn.addEventListener('click', function() {
            confirmarEliminarHorario(this.getAttribute('data-id'));
        });
    });
}

function confirmarEliminarHorario(id) {
    Swal.fire({
        title: '¿Eliminar horario?',
        text: 'El médico dejará de estar disponible para citas en este bloque.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) eliminarHorario(id);
    });
}

function eliminarHorario(id) {
    fetch(`/medicos/api/horarios/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Eliminado', res.message, 'success');
                cargarHorarios(selectMedico.value);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => console.error(err));
}