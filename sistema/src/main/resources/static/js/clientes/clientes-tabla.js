function inicializarTablaClientes() {
    dataTable = $('#tablaClientes').DataTable({
        ajax: {
            url: `${API_URL}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasClientes(),
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasClientes() {
    return [
        {
            data: null,
            render: row => `
                <strong>${row.numeroDocumento}</strong><br>
                <small class="text-muted">
                    ${
                        row.tipoDocumento === '1'
                            ? 'DNI'
                            : row.tipoDocumento === '6'
                                ? 'RUC'
                                : 'CE/PAS'
                    }
                </small>`
        },
        {
            data: 'nombreCompleto'
        },
        {
            data: null,
            render: renderContactoCliente
        },
        {
            data: 'fechaRegistro',
            render: data =>
                data
                    ? new Date(data).toLocaleDateString('es-PE')
                    : ''
        },
        {
            data: null,
            className: 'text-center',
            render: row => `
                <button class="btn btn-sm btn-dark"
                    onclick="verHistorial('${row.numeroDocumento}','${row.nombreCompleto}')">
                    <i class="bi bi-clock-history me-1"></i>
                    Ver Todo
                </button>`
        },
        {
            data: 'id',
            className: 'text-center',
            render: id => `
                <div class="btn-group btn-group-sm">
                    <button
                        class="btn btn-outline-primary action-edit"
                        data-id="${id}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button
                        class="btn btn-outline-danger"
                        onclick="eliminarCliente(${id})">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>`
        }
    ];
}

function renderContactoCliente(row) {
    let html = '';

    if (row.telefono) {
        html += `<div class="small">
                    <i class="bi bi-whatsapp text-success"></i>
                    ${row.telefono}
                 </div>`;
    }

    if (row.correo) {
        html += `<div class="small">
                    <i class="bi bi-envelope"></i>
                    ${row.correo}
                 </div>`;
    }

    return html || '<span class="text-muted small">Sin datos</span>';
}