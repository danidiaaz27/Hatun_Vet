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

    // Nota de Venta es un documento interno y ya no exige DNI/Nombre (los campos
    // quedan bloqueados con un valor genérico, ver ventas-cliente.js). Si viene de
    // una cita/grooming importado, los campos ya vienen con datos reales y
    // bloqueados, así que tampoco hace falta volver a validarlos aquí.
    if (tipoDoc === '0') return true;

    const numDoc = $('#numDoc').val().trim();
    const nombre = $('#nombreCliente').val().trim();

    if (tipoDoc === '1' && numDoc.length !== 8) {
        Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
        return false;
    }

    if (tipoDoc === '6' && numDoc.length !== 11) {
        Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
        return false;
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
        // CORREGIDO: las líneas de descuento (Compra Mínima, Descuento General) NO
        // son productos reales (no existen en la tabla de productos), así que no
        // deben mandarse dentro de "items" o el backend tira "Producto no
        // encontrado". Se excluyen aquí y su monto se manda aparte.
        descuentoGeneral: calcularDescuentoGeneralTotal(),
        cliente: crearClienteVenta(),
        comprobante: crearComprobanteVenta(),
        items: carrito
            .filter(item => !esLineaDeDescuento(item))
            .map(crearItemApiVenta)
    };
}

function esLineaDeDescuento(item) {
    // Una línea de descuento es un ítem "virtual" generado por una promoción
    // (isPromoGift) con precio negativo. Los regalos (isPromoGift con precio 0)
    // sí son productos reales y deben seguir mandándose para descontar stock.
    return item.isPromoGift && item.precio < 0;
}

function calcularDescuentoGeneralTotal() {
    let total = 0;

    carrito.forEach(item => {
        if (esLineaDeDescuento(item)) {
            total += Math.abs(item.precio * item.cantidad);
        }
    });

    return parseFloat(total.toFixed(2));
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
        tipoPago: obtenerTipoPagoMiapicloud(metodo),
        // CORREGIDO: antes no se enviaba "medioPago", así que el backend siempre
        // registraba el ingreso en Caja como "EFECTIVO" sin importar el método real.
        medioPago: metodo.toUpperCase(),
        observacion: tipoDocSel === '0' ? 'Nota de Venta Interna HatunVet' : 'Generado desde POS HatunVet'
    };
}

function obtenerTipoPagoMiapicloud(metodo) {
    // CORREGIDO: antes "plin" no estaba contemplado y caía en "Contado".
    if (metodo === 'yape') return 'Yape';
    if (metodo === 'plin') return 'Plin';
    return 'Contado';
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
        // SI ES NOTA DE VENTA: Mostramos el modal de aviso con el botón de imprimir.
        // No pasa por Miapicloud, así que el número de comprobante viene directo del
        // backend (venta.serie + venta.correlativo reales, no un valor simulado).
        if (tipoDocSel === '0') {
            const numeroNota = obtenerNumeroNotaVenta(data);

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
                    // (distinto al de Boleta/Factura, ya que no es un comprobante
                    // de pago electrónico que viajó por API).
                    imprimirTicketNotaVentaLocal(numeroNota);
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

function obtenerNumeroNotaVenta(data) {
    // El backend devuelve todo dentro de la clave "miapicloud" (ver VentaController).
    const serie = data.miapicloud?.ventaSerie;
    const correlativo = data.miapicloud?.ventaCorrelativo;

    if (!serie || !correlativo) return 'S/N';

    return `${serie}-${String(correlativo).padStart(6, '0')}`;
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

// ───────────────────────────────────────────────────────────
// TICKET NOTA DE VENTA: formateado por defecto para rollo térmico
// de 80mm. La clave es declarar "@page { size: 80mm auto; }" para
// que el navegador ya no ofrezca A4/Carta como tamaño de papel al
// imprimir, sino el ancho del ticket. Así no hay que estar
// cambiando el tamaño de papel cada vez que se imprime.
//
// NOTA IMPORTANTE: esto funciona de forma consistente en navegadores
// basados en Chromium (Chrome/Edge), que es lo más común en un POS.
// Si además configuras en el sistema operativo la impresora térmica
// con un perfil de papel "80mm / continuo" como predeterminado, el
// diálogo de impresión ya la va a preseleccionar automáticamente sin
// que tengas que tocar nada.
// ───────────────────────────────────────────────────────────
function imprimirTicketNotaVentaLocal(numeroNota) {
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
                <td style="padding: 3px 0; font-size: 11px;">${item.nombre}<br><small>${item.cantidad} x S/ ${item.precio.toFixed(2)}</small></td>
                <td style="text-align: right; padding: 3px 0; font-size: 11px; vertical-align: bottom; white-space: nowrap;">S/ ${totalItem.toFixed(2)}</td>
            </tr>
        `;
    });

    const ventanaImpresion = window.open('', '_blank', 'width=380,height=650');

    ventanaImpresion.document.write(`
        <html>
        <head>
            <title>Nota de Venta N° ${numeroNota}</title>
            <style>
                /* Papel térmico 80mm por defecto: el navegador ya no debería
                   ofrecer A4/Carta como opción principal al imprimir. */
                @page {
                    size: 80mm auto;
                    margin: 0;
                }

                * { box-sizing: border-box; }

                html, body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }

                body {
                    font-family: 'Courier New', Courier, monospace;
                    width: 76mm;
                    margin: 0 auto;
                    padding: 3mm 2mm;
                    color: #000;
                }

                .text-center { text-align: center; }
                .linea-separadora { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .total-table td { font-size: 12px; }
                .bold { font-weight: bold; }

                @media print {
                    html, body { width: 76mm; }
                }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h3 style="margin: 0; font-size: 15px;">HATUNVET S.A.C.</h3>
                <p style="margin: 3px 0; font-size: 11px;">Servicios Veterinarios Integrales</p>
                <p style="margin: 2px 0; font-size: 10px;">Chiclayo, Lambayeque, Perú</p>
                <div class="linea-separadora"></div>
                <h4 style="margin: 4px 0; font-size: 13px;">NOTA DE VENTA INTERNA</h4>
                <p style="margin: 2px 0; font-size: 11px;" class="bold">N° ${numeroNota}</p>
            </div>
            
            <div class="linea-separadora"></div>
            
            <div style="font-size: 10px; line-height: 1.4;">
                <div><span class="bold">Fecha:</span> ${fechaActual}</div>
                <div><span class="bold">Cliente:</span> ${clienteNombre}</div>
                <div><span class="bold">N° Doc:</span> ${clienteDoc}</div>
                <div><span class="bold">Pago:</span> ${metodoPago}</div>
            </div>
            
            <div class="linea-separadora"></div>
            
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left; font-size: 10px; padding-bottom: 4px;">DESCRIPCIÓN</th>
                        <th style="text-align: right; font-size: 10px; padding-bottom: 4px;">TOTAL</th>
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
                <tr class="bold" style="font-size: 14px;">
                    <td style="padding-top: 4px;">TOTAL A PAGAR:</td>
                    <td style="text-align: right; padding-top: 4px;">S/ ${total}</td>
                </tr>
            </table>
            
            <div class="linea-separadora"></div>
            
            <div class="text-center" style="font-size: 10px; margin-top: 12px;">
                <p style="margin: 0;">¡Gracias por confiar en HatunVet!</p>
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