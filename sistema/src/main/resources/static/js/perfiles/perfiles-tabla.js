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
    const nombre = normalizarNombrePerfil(row.nombre);

    if (nombre === 'administrador') {
        return `
            <div class="btn-group btn-group-sm">
                ${btnBloqueado('El administrador siempre tiene acceso total')}
                ${btnBloqueado('Perfil administrador protegido')}
                ${btnBloqueado('No se puede eliminar ni desactivar')}
            </div>`;
    }

    if (nombre === 'vendedor' || nombre === 'veterinario') {
        return `
            <div class="btn-group btn-group-sm">
                ${btnPermisos(row.id, 'Configurar permisos')}
                ${btnEditar(row.id)}
                ${btnBloqueado('Perfil base protegido')}
            </div>`;
    }

    const statusClass = row.estado ? 'text-warning' : 'text-success';
    const statusIcon = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <div class="btn-group btn-group-sm">
            ${btnPermisos(row.id, 'Configurar permisos')}
            ${btnEditar(row.id)}

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

function normalizarNombrePerfil(nombre) {
    return (nombre || '').trim().toLowerCase();
}

function btnPermisos(id, titulo) {
    return `
        <button data-id="${id}"
            class="btn btn-light border action-permissions text-dark"
            title="${titulo}">
            <i class="bi bi-shield-lock-fill"></i>
        </button>`;
}

function btnEditar(id) {
    return `
        <button data-id="${id}"
            class="btn btn-light border action-edit text-primary"
            title="Editar">
            <i class="bi bi-pencil-fill"></i>
        </button>`;
}

function btnBloqueado(titulo) {
    return `
        <button type="button"
            class="btn btn-light border text-muted"
            title="${titulo}"
            disabled>
            <i class="bi bi-lock-fill"></i>
        </button>`;
}