function iniciarCobroPOS() {
    $('#btnCobrar').click(procesarVentaPOS);
}

function procesarVentaPOS() {
    if (carrito.length === 0) {
        Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');
        return;
    }

    if (!validarDatosCobro()) return;

    const btn = $('#btnCobrar');
    mostrarSpinnerBoton(btn, 'Procesando...');

    fetch('/ventas/api/procesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearPayloadVenta())
    })
        .then(r => r.json())
        .then(manejarRespuestaVenta)
        .catch(() =>
            Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error')
        )
        .finally(() =>
            restaurarBoton(btn, '<i class="bi bi-receipt me-2"></i> FINALIZAR VENTA')
        );
}

function validarDatosCobro() {
    const tipoDoc = $('#tipoDoc').val();
    const numDoc = $('#numDoc').val().trim();
    const nombre = $('#nombreCliente').val().trim();

    if (tipoDoc !== '0') {
        if (tipoDoc === '1' && numDoc.length !== 8) {
            Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
            return false;
        }

        if (tipoDoc === '6' && numDoc.length !== 11) {
            Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
            return false;
        }
    } else {
        if (!numDoc) {
            Swal.fire('Documento requerido', 'Ingresa un número de referencia o documento.', 'warning');
            return false;
        }
    }

    if (!nombre) {
        Swal.fire('Cliente requerido', 'Ingresa el nombre del cliente.', 'warning');
        return false;
    }

    return true;
}
function crearPayloadVenta() {
    return {
        citaId: importCitaId,
        banoCorteId: importBanoCorteId,
        abonoGrooming: calcularAbonoGrooming(),
        abonoCita: calcularAbonoCita(),
        cliente: crearClienteVenta(),
        comprobante: crearComprobanteVenta(),
        items: carrito.map(crearItemApiVenta)
    };
}

function crearClienteVenta() {
    return {
        codigoPais: 'PE',
        tipoDoc: $('#tipoDoc').val(),
        numDoc: $('#numDoc').val().trim(),
        rznSocial: $('#nombreCliente').val().trim(),
        direccion: '-'
    };
}

function crearComprobanteVenta() {
    const metodo = $('#metodoPago').val() || 'efectivo';
    const tipoDocSel = $('#tipoDoc').val();
    
    let tipoDocComprobante = '03'; // Boleta por defecto
    if (tipoDocSel === '6') tipoDocComprobante = '01'; // Factura
    if (tipoDocSel === '0') tipoDocComprobante = '00'; // Código interno para Nota de Venta

    return {
        tipoOperacion: '0101',
        tipoDoc: tipoDocComprobante,
        tipoMoneda: 'PEN',
        tipoPago: metodo === 'yape' ? 'Yape' : 'Contado',
        observacion: tipoDocSel === '0' ? 'Nota de Venta Interna HatunVet' : 'Generado desde POS HatunVet'
    };
}

function crearItemApiVenta(item) {
    const valorUnit = item.precio / (1 + TASA_IGV);
    const base = valorUnit * item.cantidad;
    const igvItem = (item.precio * item.cantidad) - base;

    return {
        codProducto: item.codigo,
        descripcion: item.nombre,
        unidad: 'NIU',
        cantidad: item.cantidad,
        mtoBaseIgv: parseFloat(base.toFixed(2)),
        mtoValorUnitario: parseFloat(valorUnit.toFixed(2)),
        mtoPrecioUnitario: parseFloat(item.precio.toFixed(2)),
        codeAfect: '10',
        igvPorcent: 18,
        igv: parseFloat(igvItem.toFixed(2))
    };
}

function calcularAbonoGrooming() {
    let total = 0;

    carrito.forEach(item => {
        if (item.isGroomingImported && item.banoCorteId === importBanoCorteId) {
            total += item.precio * item.cantidad;
        }
    });

    return parseFloat(total.toFixed(2));
}

function calcularAbonoCita() {
    let total = 0;

    carrito.forEach(item => {
        if (item.isCitaImported && item.citaId === importCitaId) {
            total += item.precio * item.cantidad;
        }
    });

    return parseFloat(total.toFixed(2));
}

function manejarRespuestaVenta(data) {
    const tipoDocSel = $('#tipoDoc').val();

    if (data.success) {
        // SI ES NOTA DE VENTA: Mostramos el modal de aviso con el botón de imprimir
        if (tipoDocSel === '0') {
            const nroNota = data.venta?.id || data.data?.id || Math.floor(Math.random() * 90000) + 10000;
            
            Swal.fire({
                title: '¡Venta Realizada!',
                text: 'La Nota de Venta se registró correctamente en el sistema.',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: '<i class="bi bi-printer"></i> Imprimir Ticket',
                cancelButtonText: 'Cerrar',
                confirmButtonColor: '#0A3D91',
                cancelButtonColor: '#6b7a99',
                allowOutsideClick: false
            }).then(choice => {
                if (choice.isConfirmed) {
                    // Si da clic en Imprimir, recién se genera e imprime el ticket
                    imprimirTicketNotaVentaLocal(nroNota);
                }
                // Limpiamos el carrito al finalizar todo
                resetearPOSVenta();
            });
            return;
        }
        
        // Flujo normal de Boleta/Factura mediante miapicloud
        if (data.miapicloud?.respuesta?.success) {
            mostrarVentaExitosa(data.miapicloud.respuesta);
            return;
        }
    }

    Swal.fire(
        'Error',
        data.message || 'La API o SUNAT rechazó el comprobante.',
        'error'
    );
}

function mostrarVentaExitosa(res) {
    const esOffline = res['pdf-ticket'] === '#';

    Swal.fire({
        title: esOffline ? '¡Guardado Local Exitoso!' : '¡Venta Realizada!',
        text: esOffline
            ? 'La venta se guardó de forma local.'
            : 'Comprobante emitido correctamente.',
        icon: esOffline ? 'info' : 'success',
        showCancelButton: !esOffline,
        confirmButtonText: esOffline ? 'Entendido' : '<i class="bi bi-printer"></i> Ticket',
        cancelButtonText: '<i class="bi bi-file-earmark-pdf"></i> A4',
        confirmButtonColor: '#0A3D91',
        cancelButtonColor: '#D32F2F',
        allowOutsideClick: false
    }).then(choice => finalizarRespuestaVenta(choice, res, esOffline));
}

function finalizarRespuestaVenta(choice, res, esOffline) {
    if (!esOffline) {
        if (choice.isConfirmed) window.open(res['pdf-ticket'], '_blank');
        else if (choice.dismiss === Swal.DismissReason.cancel) {
            window.open(res['pdf-a4'], '_blank');
        }
    }

    resetearPOSVenta();
}

function imprimirTicketNotaVentaLocal(nroNota) {
    const clienteNombre = $('#nombreCliente').val().trim();
    const clienteDoc = $('#numDoc').val().trim();
    const metodoPago = $('#metodoPago').val().toUpperCase();
    const fechaActual = new Date().toLocaleString('es-PE');

    const subtotal = $('#lblOpGravadas').text();
    const igv = $('#lblIgv').text();
    const total = $('#lblTotal').text();

    let itemsHtml = '';
    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        itemsHtml += `
            <tr>
                <td style="padding: 5px 0; font-size: 12px;">${item.nombre}<br><small>${item.cantidad} x S/ ${item.precio.toFixed(2)}</small></td>
                <td style="text-align: right; padding: 5px 0; font-size: 12px; vertical-align: bottom;">S/ ${totalItem.toFixed(2)}</td>
            </tr>
        `;
    });

    const ventanaImpresion = window.open('', '_blank', 'width=350,height=600');
    
    ventanaImpresion.document.write(`
        <html>
        <head>
            <title>Nota de Venta N° ${nroNota}</title>
            <style>
                @page { margin: 0; }
                body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 10px; color: #000; background: #fff; }
                .text-center { text-align: center; }
                .linea-separadora { border-top: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; }
                .total-table td { font-size: 13px; }
                .bold { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h3 style="margin: 0; font-size: 16px;">HATUNVET S.A.C.</h3>
                <p style="margin: 3px 0; font-size: 12px;">Servicios Veterinarios Integrales</p>
                <p style="margin: 2px 0; font-size: 11px;">Chiclayo, Lambayeque, Perú</p>
                <div class="linea-separadora"></div>
                <h4 style="margin: 5px 0; font-size: 14px;">NOTA DE VENTA INTERNA</h4>
                <p style="margin: 2px 0; font-size: 12px;" class="bold">N° NV-${String(nroNota).padStart(6, '0')}</p>
            </div>
            
            <div class="linea-separadora"></div>
            
            <div style="font-size: 11px; line-height: 1.4;">
                <div><span class="bold">Fecha:</span> ${fechaActual}</div>
                <div><span class="bold">Cliente:</span> ${clienteNombre}</div>
                <div><span class="bold">N° Doc:</span> ${clienteDoc}</div>
                <div><span class="bold">Pago:</span> ${metodoPago}</div>
            </div>
            
            <div class="linea-separadora"></div>
            
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left; font-size: 11px; padding-bottom: 5px;">DESCRIPCIÓN</th>
                        <th style="text-align: right; font-size: 11px; padding-bottom: 5px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="linea-separadora"></div>
            
            <table class="total-table">
                <tr><td>Op. Gravada:</td><td style="text-align: right;">S/ ${subtotal}</td></tr>
                <tr><td>I.G.V. (18%):</td><td style="text-align: right;">S/ ${igv}</td></tr>
                <tr class="bold" style="font-size: 15px;">
                    <td style="padding-top: 5px;">TOTAL A PAGAR:</td>
                    <td style="text-align: right; padding-top: 5px;">S/ ${total}</td>
                </tr>
            </table>
            
            <div class="linea-separadora"></div>
            
            <div class="text-center" style="font-size: 11px; margin-top: 15px;">
                <p style="margin: 0;">¡Gracias por confiar en HatunVet!</p>
                <p style="margin: 4px 0 0 0;">Este documento no es un comprobante de pago electrónico.</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 300);
                };
            <\/script>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
}