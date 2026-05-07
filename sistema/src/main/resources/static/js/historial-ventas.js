$(document).ready(function() {
    // RUC de tu empresa registrada en Miapicloud (Para armar los links)
    const RUC_EMISOR = "20494100186";

    // Variable global para guardar los datos originales y usarlos en el modal
    let ventasData = [];

    // 1. Inicializar DataTable
    let dataTable = $('#tablaVentas').DataTable({
        ajax: {
            url: '/ventas/api/historial',
            dataSrc: function(json) {
                ventasData = json.data; // Guardamos copia en memoria
                return json.data;
            }
        },
        order: [[0, 'desc']], // Ordenar por fecha más reciente por defecto
        columns: [
            {
                data: 'fechaEmision',
                render: data => {
                    if(!data) return '';
                    let d = new Date(data);
                    return d.toLocaleDateString('es-PE') + ' ' + d.toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'});
                }
            },
            {
                data: null,
                render: row => `<span class="fw-bold" style="color: var(--vet-blue)">${row.serie}-${row.correlativo}</span>`
            },
            { data: 'clienteNombre', className: 'text-truncate', style: 'max-width: 200px;' },
            { data: 'clienteDocumento' },
            {
                data: 'total',
                className: 'text-end fw-bold text-success',
                render: data => `S/ ${parseFloat(data).toFixed(2)}`
            },
            {
                data: 'estado',
                render: data => {
                    if (data === 'FACTURADO') return '<span class="badge bg-success">Facturado</span>';
                    if (data === 'ANULADO') return '<span class="badge bg-danger">Anulado</span>';
                    return `<span class="badge bg-secondary">${data}</span>`;
                }
            },
            {
                data: null,
                orderable: false,
                className: 'text-center',
                render: function(data, type, row) {
                    // Armamos los links directos a Miapicloud
                    const baseUrl = `https://miapi.cloud/apifact/documents`;
                    const nombreArchivo = `${RUC_EMISOR}-${row.tipoComprobante}-${row.serie}-${row.correlativo}`;

                    const linkA4 = `${baseUrl}/pdf/${RUC_EMISOR}/invoice/a4/${nombreArchivo}.pdf`;
                    const linkTicket = `${baseUrl}/pdf/${RUC_EMISOR}/invoice/ticket/${nombreArchivo}.pdf`;
                    const linkXml = `${baseUrl}/xml/${RUC_EMISOR}/signed/${nombreArchivo}.XML`;

                    return `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-outline-primary action-ver-detalle" title="Ver Productos">
                                <i class="bi bi-eye-fill"></i> Productos
                            </button>
                            <a href="${linkTicket}" target="_blank" class="btn btn-outline-danger" title="Ver Ticket"><i class="bi bi-receipt"></i></a>
                            <a href="${linkA4}" target="_blank" class="btn btn-outline-danger" title="Ver A4"><i class="bi bi-file-earmark-pdf"></i></a>
                            <a href="${linkXml}" target="_blank" class="btn btn-outline-secondary" title="Ver XML"><i class="bi bi-filetype-xml"></i></a>
                        </div>
                    `;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    // 2. Lógica para ver el Detalle de Productos
    $('#tablaVentas tbody').on('click', '.action-ver-detalle', function() {
        const idVenta = $(this).data('id');
        const venta = ventasData.find(v => v.id === idVenta);

        if (venta) {
            $('#lblModalComprobante').text(`${venta.serie}-${venta.correlativo}`);
            $('#lblModalTotal').text(venta.total.toFixed(2));

            const tbody = $('#tbodyDetalles');
            tbody.empty();

            venta.detalles.forEach(d => {
                tbody.append(`
                    <tr>
                        <td><small class="text-muted">${d.producto.codigo}</small></td>
                        <td class="fw-bold">${d.producto.nombre}</td>
                        <td class="text-center">${d.cantidad}</td>
                        <td class="text-end">S/ ${d.precioUnitario.toFixed(2)}</td>
                        <td class="text-end text-success fw-bold">S/ ${d.importeTotal.toFixed(2)}</td>
                    </tr>
                `);
            });

            new bootstrap.Modal(document.getElementById('modalDetalleVenta')).show();
        }
    });

    // 3. Filtro de Fechas (DataTables Custom Search)
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            let min = $('#filtroFechaInicio').val();
            let max = $('#filtroFechaFin').val();

            // Extraer solo la fecha de la columna 0 (YYYY-MM-DD para comparar fácil)
            let rowData = ventasData[dataIndex];
            if (!rowData) return true;

            let fechaVenta = rowData.fechaEmision.split('T')[0]; // Toma '2026-04-20'

            if (min && fechaVenta < min) return false;
            if (max && fechaVenta > max) return false;

            return true;
        }
    );

    // Activar los filtros al cambiar los inputs
    $('#filtroFechaInicio, #filtroFechaFin').on('change', function() {
        dataTable.draw();
    });

    // Botón para limpiar los filtros
    $('#btnLimpiarFiltros').click(function() {
        $('#filtroFechaInicio').val('');
        $('#filtroFechaFin').val('');
        dataTable.draw();
    });
});