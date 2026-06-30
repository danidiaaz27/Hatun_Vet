function inicializarTablaUsuarios() {
    dataTable = $('#tablaUsuarios').DataTable({
        ajax: {
            url: `${API_BASE}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasUsuarios(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasUsuarios() {
    return [
        {
            data: 'nombre',
            className: 'fw-bold'
        },
        {
            data: 'usuario',
            className: 'text-muted'
        },
        {
            data: 'perfil',
            render: renderPerfilUsuario
        },
        {
            data: 'activo',
            render: renderEstadoUsuario
        },
        {
            data: null,
            render: renderAccionesUsuario
        }
    ];
}

function renderPerfilUsuario(data) {
    return data
        ? `<span class="badge bg-secondary">${data.nombre}</span>`
        : '<span class="text-danger">Sin Perfil</span>';
}

function renderEstadoUsuario(data) {
    return data
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
}

function renderAccionesUsuario(data, type, row) {
    let actions = `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}"
                class="btn btn-light border action-edit text-primary"
                title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>
    `;

    if (row.usuario !== 'admin') {
        actions += renderAccionesUsuarioNoAdmin(row);
    }

    return actions + '</div>';
}

function renderAccionesUsuarioNoAdmin(row) {
    const estadoClass = row.activo ? 'text-warning' : 'text-success';
    const estadoIcon = row.activo ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <button data-id="${row.id}"
            class="btn btn-light border action-status ${estadoClass}"
            title="Estado">
            <i class="bi ${estadoIcon}"></i>
        </button>

        <button data-id="${row.id}"
            class="btn btn-light border action-delete text-danger"
            title="Eliminar">
            <i class="bi bi-trash-fill"></i>
        </button>
    `;
}