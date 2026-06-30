function cargarPermisos(vetId) {
    const tbody = document.querySelector('#tablaPermisos tbody');
    const alertSin = document.getElementById('sinPermisosAlert');

    tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-muted">Cargando ausencias...</td></tr>';
    alertSin.style.display = 'none';

    fetch(`/medicos/api/${vetId}/permisos`)
        .then(r => r.json())
        .then(data => renderPermisos(data, tbody, alertSin))
        .catch(err => {
            console.error(err);
            tbody.innerHTML =
                '<tr><td colspan="5" class="text-center text-danger">Error al cargar ausencias</td></tr>';
        });
}

function renderPermisos(data, tbody, alertSin) {
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        alertSin.style.display = 'block';
        return;
    }

    data.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    data.forEach(p => tbody.appendChild(crearFilaPermiso(p)));

    conectarBotonesPermisos();
}

function crearFilaPermiso(permiso) {
    const tr = document.createElement('tr');
    const estado = obtenerEstadoPermiso(permiso);

    tr.innerHTML = `
        <td><small>${formatearFecha(permiso.fechaInicio)}</small></td>
        <td><small>${formatearFecha(permiso.fechaFin)}</small></td>
        <td><span class="text-dark fw-bold">${permiso.motivo}</span></td>
        <td><span class="badge ${estado.badgeClass}">${estado.texto}</span></td>
        <td>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-link fs-4 p-0 btn-toggle-permiso"
                    data-id="${permiso.id}" title="Activar/Desactivar ausencia">
                    <i class="bi ${estado.icono}"></i>
                </button>

                <button class="btn btn-sm btn-outline-danger btn-eliminar-permiso"
                    data-id="${permiso.id}">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        </td>
    `;

    return tr;
}

function obtenerEstadoPermiso(permiso) {
    return {
        badgeClass: permiso.activo ? 'bg-success' : 'bg-secondary',
        texto: permiso.activo ? 'Activo' : 'Inactivo',
        icono: permiso.activo
            ? 'bi-toggle2-on text-success'
            : 'bi-toggle2-off text-muted'
    };
}

function conectarBotonesPermisos() {
    document.querySelectorAll('.btn-toggle-permiso').forEach(btn => {
        btn.addEventListener('click', function() {
            togglePermiso(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.btn-eliminar-permiso').forEach(btn => {
        btn.addEventListener('click', function() {
            confirmarEliminarPermiso(this.getAttribute('data-id'));
        });
    });
}

function togglePermiso(id) {
    fetch(`/medicos/api/permisos/${id}/toggle`, { method: 'POST' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                mostrarToastPermiso(res.message);
                cargarPermisos(selectMedico.value);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => console.error(err));
}

function mostrarToastPermiso(mensaje) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        icon: 'success',
        title: mensaje
    });
}

function confirmarEliminarPermiso(id) {
    Swal.fire({
        title: '¿Eliminar registro de ausencia?',
        text: 'El historial de esta ausencia se eliminará de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) eliminarPermiso(id);
    });
}

function eliminarPermiso(id) {
    fetch(`/medicos/api/permisos/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Eliminado', res.message, 'success');
                cargarPermisos(selectMedico.value);
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err => console.error(err));
}