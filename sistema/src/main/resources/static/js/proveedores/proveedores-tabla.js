function inicializarTablaProveedores() {
    dataTable = $('#tablaProveedores').DataTable({
        ajax: {
            url: `${API_BASE}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasProveedores(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasProveedores() {
    return [
        { data: 'nombre', className: 'fw-bold text-primary' },
        { data: 'ruc' },
        { data: null, render: renderContactoProveedor },
        { data: 'direccion', render: renderDireccionProveedor },
        {
            data: 'estado',
            className: 'text-center',
            render: renderEstadoProveedor
        },
        {
            data: null,
            orderable: false,
            className: 'text-center',
            render: renderAccionesProveedor
        }
    ];
}

function renderContactoProveedor(row) {
    let html = '';

    if (row.contacto) {
        html += `<div class="small"><i class="bi bi-person-badge me-1"></i>${row.contacto}</div>`;
    }

    if (row.telefono) {
        html += `<div class="small"><i class="bi bi-telephone me-1"></i>${row.telefono}</div>`;
    }

    if (row.correo) {
        html += `<div class="small"><i class="bi bi-envelope me-1"></i>${row.correo}</div>`;
    }

    return html || '<span class="text-muted fst-italic">Sin datos</span>';
}

function renderDireccionProveedor(data) {
    return data || '<span class="text-muted fst-italic">Sin dirección</span>';
}

function renderEstadoProveedor(estado) {
    return estado
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
}

function renderAccionesProveedor(row) {
    const iconColor = row.estado ? 'text-warning' : 'text-success';
    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>

            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar estado">
                <i class="bi ${iconClass}"></i>
            </button>

            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>`;
}