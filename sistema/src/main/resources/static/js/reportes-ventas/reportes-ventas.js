const RV_TIPOS = { '01': 'Factura', '03': 'Boleta', '00': 'Nota de Venta' };
const RV_ESTADOS_TXT = {
    FACTURADO: 'Facturado', PENDIENTE_ENVIO: 'Pendiente de Envío', ERROR_FACTURACION: 'Error Facturación',
    RECHAZADO_SUNAT: 'Rechazado SUNAT', NOTA_VENTA: 'Nota de Venta', ANULADO: 'Anulado'
};
const RV_ESTADOS_BADGE = {
    FACTURADO: 'bg-success', PENDIENTE_ENVIO: 'bg-warning text-dark', ERROR_FACTURACION: 'bg-danger',
    RECHAZADO_SUNAT: 'bg-danger', NOTA_VENTA: 'bg-info', ANULADO: 'bg-secondary'
};

let rvTabla = null;

function rvEstadoTexto(e) { return RV_ESTADOS_TXT[e] || e; }
function rvRenderEstado(e) { return `<span class="badge ${RV_ESTADOS_BADGE[e] || 'bg-secondary'}">${rvEstadoTexto(e)}</span>`; }

function rvFormatFecha(data) {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('es-PE') + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function rvFiltrosActuales() {
    return {
        fechaDesde: $('#rvFechaDesde').val(),
        fechaHasta: $('#rvFechaHasta').val(),
        tipoComprobante: $('#rvTipoComprobante').val(),
        estado: $('#rvEstado').val()
    };
}

// NUEVO: la tabla ya NO carga todo de golpe. Usa DataTables serverSide: el backend
// solo manda 10 registros por página (ver /reportes/api/ventas-filtrado?page=&size=).
function rvInicializarTabla() {
    rvTabla = $('#tablaReporteVentas').DataTable({
        dom: 'rtip',
        processing: true,
        serverSide: true,
        pageLength: 10,
        lengthChange: false,
        searching: false,
        order: [[0, 'desc']],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
        ajax: function (data, callback) {
            const params = new URLSearchParams(rvFiltrosActuales());
            params.set('page', Math.floor(data.start / data.length));
            params.set('size', data.length);

            fetch(`/reportes/api/ventas-filtrado?${params.toString()}`)
                .then(r => r.json())
                .then(res => {
                    if (!res.success) {
                        Swal.fire('Error', res.message || 'No se pudo cargar el reporte.', 'error');
                        callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                        return;
                    }
                    callback({
                        draw: data.draw,
                        recordsTotal: res.totalRegistros,
                        recordsFiltered: res.totalRegistros,
                        data: res.data
                    });
                    rvActualizarKPIs(res);
                })
                .catch(() => {
                    Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error');
                    callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                });
        },
        columns: [
            { data: 'fechaEmision', render: (d, type) => (type === 'sort' || type === 'type') ? d : rvFormatFecha(d) },
            { data: null, render: r => `${r.serie}-${r.correlativo}` },
            { data: 'tipoComprobante', render: t => RV_TIPOS[t] || t },
            { data: 'clienteNombre' },
            { data: 'clienteDocumento' },
            { data: 'estado', render: rvRenderEstado },
            { data: 'medioPago', render: m => m || '-' },
            { data: 'opGravadas', className: 'text-end', render: v => `S/ ${parseFloat(v || 0).toFixed(2)}` },
            { data: 'igv', className: 'text-end', render: v => `S/ ${parseFloat(v || 0).toFixed(2)}` },
            { data: 'total', className: 'text-end fw-bold text-success', render: v => `S/ ${parseFloat(v || 0).toFixed(2)}` }
        ]
    });
}

// KPIs calculados por el backend sobre TODO el filtro (no solo la página visible)
function rvActualizarKPIs(res) {
    const cantidad = res.totalRegistros || 0;
    const total = parseFloat(res.montoTotal || 0);
    const igv = parseFloat(res.igvTotal || 0);
    const promedio = cantidad > 0 ? total / cantidad : 0;

    $('#rvKpiCantidad').text(cantidad);
    $('#rvKpiTotal').text(`S/ ${total.toFixed(2)}`);
    $('#rvKpiPromedio').text(`S/ ${promedio.toFixed(2)}`);
    $('#rvKpiIgv').text(`S/ ${igv.toFixed(2)}`);
}

function rvBuscar() { rvTabla.ajax.reload(); }

function rvLimpiar() {
    $('#rvFechaDesde, #rvFechaHasta').val('');
    $('#rvTipoComprobante, #rvEstado').val('');
    rvTabla.ajax.reload();
}

// Trae TODO lo filtrado (sin paginar) solo al momento de exportar.
function rvObtenerDatosParaExportar() {
    const params = new URLSearchParams(rvFiltrosActuales());
    return fetch(`/reportes/api/ventas-filtrado-todos?${params.toString()}`)
        .then(r => r.json())
        .then(res => {
            if (!res.success) throw new Error(res.message || 'Error al exportar');
            return res.data;
        });
}

// ───────────── EXPORT EXCEL (ExcelJS, con estilos) ─────────────
async function rvExportarExcel() {
    let data;
    try { data = await rvObtenerDatosParaExportar(); }
    catch (e) { Swal.fire('Error', e.message, 'error'); return; }

    if (!data.length) { Swal.fire('Sin datos', 'No hay registros para exportar.', 'info'); return; }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Reporte de Ventas');
    ws.columns = [
        { width: 18 }, { width: 16 }, { width: 12 }, { width: 26 }, { width: 14 },
        { width: 18 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }
    ];

    ws.mergeCells('A1:J1');
    ws.getCell('A1').value = 'HATUNVET S.A.C. — Reporte de Ventas';
    ws.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A3D91' } };
    ws.getRow(1).height = 28;

    ws.mergeCells('A2:J2');
    ws.getCell('A2').value = `Generado el ${new Date().toLocaleString('es-PE')} — ${data.length} comprobantes`;
    ws.getCell('A2').font = { italic: true, color: { argb: 'FF6B7A99' } };
    ws.getCell('A2').alignment = { horizontal: 'center' };
    ws.getRow(2).height = 20;

    const headers = ['Fecha', 'Comprobante', 'Tipo', 'Cliente', 'Documento', 'Estado', 'Medio Pago', 'Subtotal', 'IGV', 'Total'];
    const headerRow = ws.getRow(4);
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A3D91' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDE7F3' } } };
    });
    headerRow.height = 20;

    let rowIdx = 5;
    let totalGeneral = 0, igvGeneral = 0, subtotalGeneral = 0;

    data.forEach(v => {
        const row = ws.getRow(rowIdx);
        const subtotal = parseFloat(v.opGravadas || 0), igv = parseFloat(v.igv || 0), total = parseFloat(v.total || 0);
        subtotalGeneral += subtotal; igvGeneral += igv; totalGeneral += total;

        const valores = [
            rvFormatFecha(v.fechaEmision), `${v.serie}-${v.correlativo}`, RV_TIPOS[v.tipoComprobante] || v.tipoComprobante,
            v.clienteNombre || '-', v.clienteDocumento || '-', rvEstadoTexto(v.estado), v.medioPago || '-',
            subtotal, igv, total
        ];
        valores.forEach((val, i) => {
            const cell = row.getCell(i + 1);
            cell.value = val;
            if (i >= 7) cell.numFmt = '"S/ "#,##0.00';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowIdx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF' } };
            cell.border = { bottom: { style: 'hair', color: { argb: 'FFE8EEF6' } } };
        });
        rowIdx++;
    });

    const totalRow = ws.getRow(rowIdx);
    totalRow.getCell(7).value = 'TOTALES:';
    totalRow.getCell(7).font = { bold: true };
    totalRow.getCell(7).alignment = { horizontal: 'right' };
    [subtotalGeneral, igvGeneral, totalGeneral].forEach((val, i) => {
        const cell = totalRow.getCell(8 + i);
        cell.value = val;
        cell.numFmt = '"S/ "#,##0.00';
        cell.font = { bold: true, color: { argb: 'FF0A3D91' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF2FF' } };
    });

    const buffer = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }));
    const a = document.createElement('a');
    a.href = url; a.download = `reporte-ventas-${Date.now()}.xlsx`; a.click();
    URL.revokeObjectURL(url);
}

// ───────────── EXPORT PDF (pdfMake, armado a mano con diseño) ─────────────
async function rvExportarPdf() {
    let data;
    try { data = await rvObtenerDatosParaExportar(); }
    catch (e) { Swal.fire('Error', e.message, 'error'); return; }

    if (!data.length) { Swal.fire('Sin datos', 'No hay registros para exportar.', 'info'); return; }

    const th = t => ({ text: t, bold: true, color: '#FFFFFF', fillColor: '#0A3D91', fontSize: 9 });
    const body = [[
        th('Fecha'), th('Comprobante'), th('Tipo'), th('Cliente'), th('Doc.'),
        th('Estado'), th('Medio Pago'), th('Subtotal'), th('IGV'), th('Total')
    ]];

    let totalGeneral = 0, igvGeneral = 0, subtotalGeneral = 0;

    data.forEach((v, i) => {
        const fill = i % 2 === 0 ? '#FFFFFF' : '#F0F4FA';
        const subtotal = parseFloat(v.opGravadas || 0), igv = parseFloat(v.igv || 0), total = parseFloat(v.total || 0);
        subtotalGeneral += subtotal; igvGeneral += igv; totalGeneral += total;

        body.push([
            { text: rvFormatFecha(v.fechaEmision), fillColor: fill, fontSize: 8 },
            { text: `${v.serie}-${v.correlativo}`, fillColor: fill, fontSize: 8 },
            { text: RV_TIPOS[v.tipoComprobante] || v.tipoComprobante, fillColor: fill, fontSize: 8 },
            { text: v.clienteNombre || '-', fillColor: fill, fontSize: 8 },
            { text: v.clienteDocumento || '-', fillColor: fill, fontSize: 8 },
            { text: rvEstadoTexto(v.estado), fillColor: fill, fontSize: 8 },
            { text: v.medioPago || '-', fillColor: fill, fontSize: 8 },
            { text: `S/ ${subtotal.toFixed(2)}`, alignment: 'right', fillColor: fill, fontSize: 8 },
            { text: `S/ ${igv.toFixed(2)}`, alignment: 'right', fillColor: fill, fontSize: 8 },
            { text: `S/ ${total.toFixed(2)}`, alignment: 'right', fillColor: fill, fontSize: 8, bold: true }
        ]);
    });

    body.push([
        { text: '', colSpan: 7 }, {}, {}, {}, {}, {}, {},
        { text: `S/ ${subtotalGeneral.toFixed(2)}`, bold: true, alignment: 'right', fillColor: '#eaf2ff', fontSize: 8 },
        { text: `S/ ${igvGeneral.toFixed(2)}`, bold: true, alignment: 'right', fillColor: '#eaf2ff', fontSize: 8 },
        { text: `S/ ${totalGeneral.toFixed(2)}`, bold: true, alignment: 'right', fillColor: '#eaf2ff', color: '#0A3D91', fontSize: 8 }
    ]);

    const docDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [30, 70, 30, 40],
        header: {
            columns: [
                { text: 'HATUNVET S.A.C.', bold: true, fontSize: 16, color: '#0A3D91', margin: [30, 20, 0, 0] },
                { text: 'Reporte de Ventas', alignment: 'right', fontSize: 12, color: '#6b7a99', margin: [0, 25, 30, 0] }
            ]
        },
        footer: (page, total) => ({
            text: `Página ${page} de ${total} — Generado el ${new Date().toLocaleString('es-PE')}`,
            alignment: 'center', fontSize: 8, color: '#8a9bc0', margin: [0, 10, 0, 0]
        }),
        content: [
            { text: `${data.length} comprobantes encontrados`, fontSize: 10, color: '#6b7a99', margin: [0, 0, 0, 10] },
            {
                table: { headerRows: 1, widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], body },
                layout: { hLineColor: () => '#dde7f3', vLineColor: () => '#dde7f3' }
            }
        ],
        defaultStyle: { fontSize: 8 }
    };

    pdfMake.createPdf(docDefinition).download(`reporte-ventas-${Date.now()}.pdf`);
}

$(document).ready(function () {
    rvInicializarTabla();
    $('#rvBtnBuscar').click(rvBuscar);
    $('#rvBtnLimpiar').click(rvLimpiar);
    $('#rvBtnExcel').click(rvExportarExcel);
    $('#rvBtnPdf').click(rvExportarPdf);
});