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
        ? `<span class="badge bg-secondary">${data.nombre || data}</span>`
        : '<span class="text-danger">Sin Perfil</span>';
}

function renderEstadoUsuario(data) {
    return data
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
}

function renderAccionesUsuario(data, type, row) {
    if (esUsuarioAdministradorPrincipal(row)) {
        return `
            <div class="btn-group btn-group-sm">
                ${btnEditarUsuario(row.id)}
                ${btnBloqueadoUsuario('El administrador principal no puede desactivarse')}
                ${btnBloqueadoUsuario('El administrador principal no puede eliminarse')}
            </div>`;
    }

    return `
        <div class="btn-group btn-group-sm">
            ${btnEditarUsuario(row.id)}
            ${btnEstadoUsuario(row)}
            ${btnEliminarUsuario(row.id)}
        </div>`;
}

function esUsuarioAdministradorPrincipal(row) {
    const usuario = normalizarTexto(row.usuario);
    const nombre = normalizarTexto(row.nombre);

    let perfilNombre = '';

    if (row.perfil) {
        perfilNombre = normalizarTexto(row.perfil.nombre || row.perfil);
    }

    return usuario === 'admin'
        || usuario.includes('admin')
        || nombre.includes('administrador')
        || perfilNombre.includes('administrador');
}

function normalizarTexto(valor) {
    return (valor || '')
        .toString()
        .trim()
        .toLowerCase();
}

function btnEditarUsuario(id) {
    return `
        <button data-id="${id}"
            class="btn btn-light border action-edit text-primary"
            title="Editar">
            <i class="bi bi-pencil-fill"></i>
        </button>`;
}

function btnEstadoUsuario(row) {
    const estadoClass = row.activo ? 'text-warning' : 'text-success';
    const estadoIcon = row.activo ? 'bi-eye-slash-fill' : 'bi-eye-fill';
    const titulo = row.activo ? 'Desactivar usuario' : 'Activar usuario';

    return `
        <button data-id="${row.id}"
            class="btn btn-light border action-status ${estadoClass}"
            title="${titulo}">
            <i class="bi ${estadoIcon}"></i>
        </button>`;
}

function btnEliminarUsuario(id) {
    return `
        <button data-id="${id}"
            class="btn btn-light border action-delete text-danger"
            title="Eliminar usuario">
            <i class="bi bi-trash-fill"></i>
        </button>`;
}

function btnBloqueadoUsuario(titulo) {
    return `
        <button type="button"
            class="btn btn-light border text-muted"
            title="${titulo}"
            disabled>
            <i class="bi bi-lock-fill"></i>
        </button>`;
}