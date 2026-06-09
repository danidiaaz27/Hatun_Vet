$(document).ready(function() {
    const API_URL = '/inventario/api';
    const modalIngreso = new bootstrap.Modal(document.getElementById('modalIngreso'));
    const modalSalida  = new bootstrap.Modal(document.getElementById('modalSalida'));
    const modalKardex  = new bootstrap.Modal(document.getElementById('modalKardex'));

    // ── DataTable ────────────────────────────────────────────────────
    let dataTable = $('#tablaInventario').DataTable({
        ajax: {
            url: `${API_URL}/productos`,
            dataSrc: function(json) {
                // Calcular stats después de cargar
                const data = json.data || [];
                const total   = data.length;
                const agotado = data.filter(p => p.stock <= 0).length;
                const bajo    = data.filter(p => p.stock > 0 && p.stock <= 5).length;
                const ok      = data.filter(p => p.stock > 5).length;

                $('#statTotal').text(total);
                $('#statAgotado').text(agotado);
                $('#statBajo').text(bajo);
                $('#statOk').text(ok);

                return data;
            }
        },
        columns: [
            {
                data: 'codigo',
                render: data => `<span class="codigo-badge">${data}</span>`
            },
            {
                data: null,
                render: row => {
                    const img = row.imagen
                        ? `<img src="/uploads/${row.imagen}" style="width:32px;height:32px;object-fit:contain;border-radius:6px;margin-right:10px;">`
                        : `<span style="width:32px;height:32px;background:#f0f4fa;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;"><i class="bi bi-box-seam" style="color:#c8d3e8;"></i></span>`;
                    return `
                        <div class="d-flex align-items-center">
                            ${img}
                            <div>
                                <div class="fw-bold" style="font-size:13.5px;">${row.nombre}</div>
                                ${row.descripcion ? `<div style="font-size:11px;color:#8a9bc0;">${row.descripcion.substring(0,40)}${row.descripcion.length > 40 ? '...' : ''}</div>` : ''}
                            </div>
                        </div>`;
                }
            },
            {
                data: 'categoria',
                render: data => data ? `<span class="cat-pill">${data}</span>` : '<span class="text-muted small">—</span>'
            },
            {
                data: 'stock',
                className: 'text-center',
                render: stock => {
                    const cls = stock <= 0 ? 'stock-agotado' : stock <= 5 ? 'stock-bajo' : 'stock-ok';
                    return `<span class="stock-badge ${cls}">${stock} uds.</span>`;
                }
            },
            {
                data: 'stock',
                className: 'text-center',
                render: stock => {
                    if (stock <= 0)  return `<span class="estado-pill estado-agotado"><span style="width:6px;height:6px;border-radius:50%;background:#b71c1c;display:inline-block;"></span> Agotado</span>`;
                    if (stock <= 5)  return `<span class="estado-pill estado-bajo"><span style="width:6px;height:6px;border-radius:50%;background:#b45309;display:inline-block;"></span> Stock Bajo</span>`;
                    return `<span class="estado-pill estado-ok"><span style="width:6px;height:6px;border-radius:50%;background:#1a6e40;display:inline-block;"></span> En Stock</span>`;
                }
            },
            {
                data: null,
                className: 'text-center',
                render: row => `
                    <div class="d-flex align-items-center justify-content-center gap-2">
                        <button class="btn-inv btn-inv-plus" onclick="abrirModalIngreso('${row.id}', '${row.nombre.replace(/'/g, "\\'")}')" title="Registrar Ingreso">+</button>
                        <button class="btn-inv btn-inv-minus" onclick="abrirModalSalida('${row.id}', '${row.nombre.replace(/'/g, "\\'")}', ${row.stock})" title="Registrar Salida">−</button>
                    </div>`
            },
            {
                data: 'id',
                className: 'text-center',
                render: id => `<button class="btn-ver-log" onclick="abrirModalKardex('${id}')"><i class="bi bi-clock-history me-1"></i>Ver Log</button>`
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" },
        order: [[0, 'asc']]
    });

    // ── Modal Ingreso ─────────────────────────────────────────────────
    window.abrirModalIngreso = function(idProd, nombreProd) {
        $('#formIngreso')[0].reset();
        $('#ingresoIdProd').val(idProd);
        $('#ingresoNombreProd').text(nombreProd);
        $('#ingresoVencimiento').addClass('d-none').prop('required', false);
        modalIngreso.show();
    };

    // ── Modal Salida ──────────────────────────────────────────────────
    window.abrirModalSalida = function(idProd, nombreProd, stockActual) {
        $('#formSalida')[0].reset();
        $('#salidaIdProd').val(idProd);
        $('#salidaNombreProd').text(nombreProd);
        $('#salidaStockActual').text(stockActual);
        modalSalida.show();
    };

    // ── Toggle fecha vencimiento ──────────────────────────────────────
    $('#checkVencimiento').change(function() {
        if (this.checked) $('#ingresoVencimiento').removeClass('d-none').prop('required', true);
        else              $('#ingresoVencimiento').addClass('d-none').prop('required', false);
    });

    // ── Submit Ingreso ────────────────────────────────────────────────
    $('#formIngreso').submit(e => {
        e.preventDefault();
        if ($('#checkVencimiento').is(':checked') && !$('#ingresoVencimiento').val()) {
            Swal.fire('Atención', 'Seleccione la fecha de vencimiento.', 'warning');
            return;
        }
        const btn = $('#btnSubmitIngreso');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Registrando...');
        enviarMovimiento($('#ingresoIdProd').val(), {
            tipoMovimiento: $('#ingresoTipo').val(),
            cantidad: parseInt($('#ingresoCantidad').val()),
            motivo: $('#ingresoMotivo').val(),
            proveedor: $('#ingresoProveedor').val(),
            numeroLote: $('#ingresoLote').val(),
            fechaVencimiento: $('#checkVencimiento').is(':checked') ? $('#ingresoVencimiento').val() : null
        }, modalIngreso, btn, 'Registrar Ingreso');
    });

    // ── Submit Salida ─────────────────────────────────────────────────
    $('#formSalida').submit(e => {
        e.preventDefault();
        const btn = $('#btnSubmitSalida');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Registrando...');
        enviarMovimiento($('#salidaIdProd').val(), {
            tipoMovimiento: $('#salidaTipo').val(),
            cantidad: parseInt($('#salidaCantidad').val()),
            motivo: $('#salidaMotivo').val()
        }, modalSalida, btn, 'Registrar Salida');
    });

    function enviarMovimiento(idProducto, data, modal, btnElement, originalText) {
        fetch(`${API_URL}/registrar?idProducto=${idProducto}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', res.message, 'success');
            } else {
                Swal.fire('Atención', res.message, 'warning');
            }
        })
        .catch(() => Swal.fire('Error', 'Fallo de conexión con el servidor', 'error'))
        .finally(() => btnElement.prop('disabled', false).html(originalText));
    }

    // ── Kardex ────────────────────────────────────────────────────────
    window.abrirModalKardex = function(idProducto) {
        const tbody = $('#tablaKardex tbody');
        tbody.html('<tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span> Cargando...</td></tr>');
        modalKardex.show();

        fetch(`${API_URL}/kardex/${idProducto}`)
            .then(r => r.json())
            .then(res => {
                tbody.empty();
                if (res.success && res.data.length > 0) {
                    res.data.forEach(mov => {
                        const f = new Date(mov.fechaRegistro);
                        const fechaStr = `${f.toLocaleDateString('es-PE')}<br><small style="color:#8a9bc0;">${f.toLocaleTimeString('es-PE', {hour:'2-digit',minute:'2-digit'})}</small>`;
                        const esPos = mov.cantidad > 0;
                        const cantStr = esPos ? `+${mov.cantidad}` : `${mov.cantidad}`;
                        const cantColor = esPos ? '#1a6e40' : '#b71c1c';
                        tbody.append(`
                            <tr>
                                <td>${fechaStr}</td>
                                <td><span style="font-size:12px;font-weight:600;">${mov.tipoMovimiento}</span></td>
                                <td class="text-center"><span style="font-weight:800;color:${cantColor};">${cantStr}</span></td>
                                <td style="font-size:12px;color:#6b7a99;">${mov.motivo || '—'}</td>
                                <td style="font-size:12px;color:#6b7a99;">${mov.responsable}</td>
                            </tr>
                        `);
                    });
                } else {
                    tbody.html('<tr><td colspan="5" class="text-center text-muted py-4">No hay movimientos registrados.</td></tr>');
                }
            });
    };
});