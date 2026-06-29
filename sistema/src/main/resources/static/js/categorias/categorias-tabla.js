function inicializarTablaCategorias() {
    dataTable = $('#tablaCategorias').DataTable({
        ajax: {
            url: `${API_BASE}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasCategorias(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasCategorias() {
    return [
        {
            data: 'nombre',
            className: 'fw-bold text-primary'
        },
        {
            data: 'descripcion',
            render: data =>
                data || '<span class="text-muted fst-italic">Sin descripción</span>'
        },
        {
            data: 'estado',
            render: data =>
                data
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-danger">Inactivo</span>'
        },
        {
            data: null,
            render: renderAccionesCategoria
        }
    ];
}

function renderAccionesCategoria(data, type, row) {
    const iconColor = row.estado ? 'text-warning' : 'text-success';
    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}"
                class="btn btn-light border action-edit text-primary"
                title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>

            <button data-id="${row.id}"
                class="btn btn-light border action-status ${iconColor}"
                title="Cambiar Estado">
                <i class="bi ${iconClass}"></i>
            </button>

            <button data-id="${row.id}"
                class="btn btn-light border action-delete text-danger"
                title="Eliminar">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>`;
}