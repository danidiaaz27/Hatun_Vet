function inicializarTablaHistorial() {
    dataTable = $('#tablaVentas').DataTable({
        ajax: {
            url: '/ventas/api/historial',
            dataSrc: function(json) {
                ventasData = json.data;
                return json.data;
            }
        },
        order: [[0, 'desc']],
        columns: obtenerColumnasHistorial(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasHistorial() {
    return [
        {
            data: 'fechaEmision',
            render: formatearFechaVenta
        },
        {
            data: null,
            render: row =>
                `<span class="fw-bold" style="color: var(--vet-blue)">
                    ${row.serie}-${row.correlativo}
                </span>`
        },
        {
            data: 'clienteNombre',
            className: 'text-truncate',
            style: 'max-width: 200px;'
        },
        {
            data: 'clienteDocumento'
        },
        {
            data: 'total',
            className: 'text-end fw-bold text-success',
            render: data => `S/ ${parseFloat(data).toFixed(2)}`
        },
        {
            data: 'estado',
            render: renderEstadoVenta
        },
        {
            data: null,
            orderable: false,
            className: 'text-center',
            render: renderAccionesVenta
        }
    ];
}

function renderAccionesVenta(data, type, row) {
    const links = crearLinksComprobante(row);

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}"
                class="btn btn-outline-primary action-ver-detalle"
                title="Ver Productos">
                <i class="bi bi-eye-fill"></i> Productos
            </button>

            <a href="${links.ticket}" target="_blank"
                class="btn btn-outline-danger" title="Ver Ticket">
                <i class="bi bi-receipt"></i>
            </a>

            <a href="${links.a4}" target="_blank"
                class="btn btn-outline-danger" title="Ver A4">
                <i class="bi bi-file-earmark-pdf"></i>
            </a>

            <a href="${links.xml}" target="_blank"
                class="btn btn-outline-secondary" title="Ver XML">
                <i class="bi bi-filetype-xml"></i>
            </a>
        </div>
    `;
}