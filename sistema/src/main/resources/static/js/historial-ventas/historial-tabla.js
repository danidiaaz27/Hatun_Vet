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
            // CORREGIDO: antes se ordenaba por el texto ya formateado
            // ("18/07/2026 14:30"), lo que DataTables ordena como string y no
            // cronológicamente. Ahora usa la fecha ISO cruda para ordenar
            // (sí es ordenable como texto porque va año-mes-día) y solo
            // formatea bonito para mostrar.
            render: function(data, type) {
                if (type === 'sort' || type === 'type') return data;
                return formatearFechaVenta(data);
            }
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
        { data: 'clienteDocumento' },
        {
            data: 'total',
            className: 'text-end fw-bold text-success',
            render: data => `S/ ${parseFloat(data).toFixed(2)}`
        },
        { data: 'estado', render: renderEstadoVenta },
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
    const esNotaVenta = row.tipoComprobante === '00' || row.serie === 'NV01';

    // CORREGIDO: Nota de Venta ya no muestra el link de Miapicloud (no aplica,
    // nunca se envió a SUNAT); abre el ticket interno reconstruido localmente.
    const botonTicket = esNotaVenta
        ? `<button class="btn btn-outline-danger" title="Ver Nota de Venta" onclick="reimprimirTicketLocalPOS('${row.id}')"><i class="bi bi-receipt"></i></button>`
        : `<a href="${links.ticket}" target="_blank" class="btn btn-outline-danger" title="Ver Ticket"><i class="bi bi-receipt"></i></a>`;

    const botonA4 = esNotaVenta
        ? ''
        : `<a href="${links.a4}" target="_blank" class="btn btn-outline-danger" title="Ver A4"><i class="bi bi-file-earmark-pdf"></i></a>`;

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}"
                class="btn btn-outline-primary action-ver-detalle"
                title="Ver Productos">
                <i class="bi bi-eye-fill"></i> Productos
            </button>
            ${botonTicket}
            ${botonA4}
        </div>
    `;
}

// NUEVO: reconstruye e imprime el ticket interno de Nota de Venta a partir del
// historial (mismo formato 80mm que usa el POS al momento de la venta).
function reimprimirTicketLocalPOS(idVenta) {
    const venta = ventasData.find(v => v.id === idVenta);
    if (!venta) return;

    const numeroNota = `${venta.serie}-${String(venta.correlativo).padStart(6, '0')}`;
    const fecha = formatearFechaVenta(venta.fechaEmision);
    const subtotal = parseFloat(venta.opGravadas || 0).toFixed(2);
    const igv = parseFloat(venta.igv || 0).toFixed(2);
    const total = parseFloat(venta.total || 0).toFixed(2);

    let itemsHtml = '';
    (venta.detalles || []).forEach(d => {
        itemsHtml += `<tr>
            <td style="padding:3px 0;font-size:11px;">${d.producto.nombre}<br><small>${d.cantidad} x S/ ${parseFloat(d.precioUnitario).toFixed(2)}</small></td>
            <td style="text-align:right;padding:3px 0;font-size:11px;white-space:nowrap;">S/ ${parseFloat(d.importeTotal).toFixed(2)}</td>
        </tr>`;
    });

    const ventana = window.open('', '_blank', 'width=380,height=650');
    ventana.document.write(`
        <html>
        <head>
            <title>Nota de Venta N° ${numeroNota}</title>
            <style>
                @page { size: 80mm auto; margin: 0; }
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; background: #fff; }
                body { font-family: 'Courier New', Courier, monospace; width: 76mm; margin: 0 auto; padding: 3mm 2mm; color: #000; }
                .text-center { text-align: center; }
                .linea { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; }
                .bold { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h3 style="margin:0;font-size:15px;">HATUNVET S.A.C.</h3>
                <p style="margin:2px 0;font-size:10px;">Chiclayo, Lambayeque, Perú</p>
                <div class="linea"></div>
                <h4 style="margin:4px 0;font-size:13px;">NOTA DE VENTA INTERNA</h4>
                <p class="bold" style="margin:2px 0;font-size:11px;">N° ${numeroNota}</p>
            </div>
            <div class="linea"></div>
            <div style="font-size:10px;line-height:1.4;">
                <div><span class="bold">Fecha:</span> ${fecha}</div>
                <div><span class="bold">Cliente:</span> ${venta.clienteNombre || '-'}</div>
                <div><span class="bold">N° Doc:</span> ${venta.clienteDocumento || '-'}</div>
            </div>
            <div class="linea"></div>
            <table>${itemsHtml}</table>
            <div class="linea"></div>
            <table>
                <tr><td>Op. Gravada:</td><td style="text-align:right;">S/ ${subtotal}</td></tr>
                <tr><td>I.G.V.:</td><td style="text-align:right;">S/ ${igv}</td></tr>
                <tr class="bold" style="font-size:14px;"><td style="padding-top:4px;">TOTAL:</td><td style="text-align:right;padding-top:4px;">S/ ${total}</td></tr>
            </table>
            <div class="linea"></div>
            <div class="text-center" style="font-size:10px;margin-top:10px;">
                <p style="margin:0;">Este documento no es un comprobante de pago electrónico.</p>
            </div>
            <script>
                window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 300); };
            <\/script>
        </body>
        </html>
    `);
    ventana.document.close();
}