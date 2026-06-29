function iniciarDetalleVenta() {
    $('#tablaVentas tbody').on(
        'click',
        '.action-ver-detalle',
        mostrarDetalleVenta
    );
}

function mostrarDetalleVenta() {
    const idVenta = $(this).data('id');
    const venta = ventasData.find(v => v.id === idVenta);

    if (!venta) return;

    cargarCabeceraDetalleVenta(venta);
    renderDetallesVenta(venta.detalles || []);
    cargarTotalesDetalleVenta(venta);

    new bootstrap.Modal(
        document.getElementById('modalDetalleVenta')
    ).show();
}

function cargarCabeceraDetalleVenta(venta) {
    $('#lblModalComprobante').text(`${venta.serie}-${venta.correlativo}`);
    $('#lblModalTipo').text(venta.tipoComprobante || 'Comprobante de venta');
    $('#lblModalFecha').text(formatearFechaVenta(venta.fechaEmision));
    $('#lblModalCliente').text(venta.clienteNombre || 'Cliente no registrado');
    $('#lblModalDocumento').text(venta.clienteDocumento || '—');
    $('#lblModalEstado').html(renderEstadoVenta(venta.estado));
}

function renderDetallesVenta(detalles) {
    const tbody = $('#tbodyDetalles');
    tbody.empty();

    detalles.forEach(d => {
        tbody.append(`
            <tr>
                <td class="ps-4">
                    <small class="text-muted">${d.producto.codigo}</small>
                </td>
                <td class="fw-bold">${d.producto.nombre}</td>
                <td class="text-center">${d.cantidad}</td>
                <td class="text-end">
                    S/ ${d.precioUnitario.toFixed(2)}
                </td>
                <td class="text-end text-success fw-bold pe-4">
                    S/ ${d.importeTotal.toFixed(2)}
                </td>
            </tr>
        `);
    });
}

function cargarTotalesDetalleVenta(venta) {
    const total = parseFloat(venta.total || 0);
    const subtotal = parseFloat(venta.subtotal || total);
    const descuento = parseFloat(venta.descuento || 0);
    const igv = parseFloat(venta.igv || 0);

    $('#lblModalTotal').text(total.toFixed(2));
    $('#lblModalSubtotal').text(subtotal.toFixed(2));
    $('#lblModalDescuento').text(descuento.toFixed(2));
    $('#lblModalIgv').text(igv.toFixed(2));
    $('#lblModalTotalResumen').text(total.toFixed(2));
}