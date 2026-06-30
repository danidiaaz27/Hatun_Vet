function inicializarTablaPerfiles() {
    dataTable = $('#tablaPerfiles').DataTable({
        ajax: {
            url: `${API_BASE}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasPerfiles(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasPerfiles() {
    return [
        {
            data: 'nombre',
            className: 'fw-bold text-primary'
        },
        {
            data: 'descripcion'
        },
        {
            data: 'estado',
            render: renderEstadoPerfil
        },
        {
            data: null,
            render: renderAccionesPerfil
        }
    ];
}

function renderAccionesPerfil(data, type, row) {
    const statusClass = row.estado ? 'text-warning' : 'text-success';
    const statusIcon = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}"
                class="btn btn-light border action-permissions text-dark"
                title="Permisos">
                <i class="bi bi-shield-lock-fill"></i>
            </button>

            <button data-id="${row.id}"
                class="btn btn-light border action-edit text-primary"
                title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>

            <button data-id="${row.id}"
                class="btn btn-light border action-status ${statusClass}"
                title="Cambiar Estado">
                <i class="bi ${statusIcon}"></i>
            </button>

            <button data-id="${row.id}"
                class="btn btn-light border action-delete text-danger"
                title="Eliminar">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>`;
}