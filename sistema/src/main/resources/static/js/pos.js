$(document).ready(function() {
    let carrito = [];
    const TASA_IGV = 0.18;

    // --- RELOJ EN TIEMPO REAL ---
    setInterval(() => {
        $('#relojActual').text(new Date().toLocaleTimeString('es-PE'));
    }, 1000);

    // --- VALIDACIONES DE DOCUMENTOS ---

    // Bloquea cualquier carácter que no sea número
    $('#numDoc').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Ajusta la longitud máxima y limpia campos al cambiar el tipo (DNI/RUC)
    $('#tipoDoc').change(function() {
        const tipo = $(this).val();
        $('#numDoc').val('');
        $('#nombreCliente').val('');
        $('#direccionCliente').val('');

        if (tipo === '1') { // DNI
            $('#numDoc').attr('maxlength', '8').attr('placeholder', 'DNI (8 dígitos)');
        } else { // RUC
            $('#numDoc').attr('maxlength', '11').attr('placeholder', 'RUC (11 dígitos)');
        }
    });
    $('#tipoDoc').trigger('change');

    // --- BUSCAR CLIENTE EN API (Miapicloud) ---
    $('#btnBuscarDoc').click(function() {
        const tipoDoc = $('#tipoDoc').val();
        const numDoc = $('#numDoc').val().trim();

        // Validaciones previas a la consulta
        if (tipoDoc === '1' && numDoc.length !== 8) {
            Swal.fire('Atención', 'El DNI debe tener exactamente 8 dígitos.', 'warning');
            return;
        }
        if (tipoDoc === '6' && numDoc.length !== 11) {
            Swal.fire('Atención', 'El RUC debe tener exactamente 11 dígitos.', 'warning');
            return;
        }

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm text-primary"></span>');

        fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
            .then(r => r.json())
            .then(res => {
                console.log("Respuesta de API Cliente:", res);

                const info = res.datos || res.data;

                if (res.success && info) {
                    if (tipoDoc === '1') {
                        // Construcción del nombre para DNI
                        let nombre = info.nombre_completo ||
                                     `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`.trim();
                        $('#nombreCliente').val(nombre);

                        // ¡CAMBIO AQUÍ! Forzamos a que la dirección quede en blanco para los DNI
                        $('#direccionCliente').val('');

                    } else {
                        // Construcción para RUC (Aquí sí llenamos la dirección)
                        $('#nombreCliente').val(info.nombre_o_razon_social || info.razon_social || info.razonSocial);
                        $('#direccionCliente').val(info.direccion_completa || info.direccion || '-');
                    }
                } else {
                    let msg = res.message || 'No se encontraron datos oficiales para este documento.';
                    Swal.fire('Información', msg, 'info');
                    $('#nombreCliente').val('');
                    $('#direccionCliente').val('');
                }
            })
            .catch(err => {
                Swal.fire('Error', 'No se pudo conectar con el servicio de consulta.', 'error');
                console.error(err);
            })
            .finally(() => btn.prop('disabled', false).html(icon));
    });

    // --- BUSCADOR DE PRODUCTOS ---
    $('#inputBuscarProducto').on('keyup', function() {
        const termino = $(this).val();
        const contenedor = $('#resultadosBusqueda');

        if (termino.length < 2) {
            contenedor.html('<div class="col-12 text-center text-muted mt-5"><i class="bi bi-box-seam fs-1 d-block mb-2"></i>Escribe al menos 2 letras...</div>');
            return;
        }

        fetch(`/ventas/api/buscar-producto?termino=${termino}`)
            .then(r => r.json())
            .then(res => {
                contenedor.empty();
                if (res.success && res.data.length > 0) {
                    res.data.forEach(p => {
                        let imgHtml = p.imagen
                            ? `<img src="/uploads/${p.imagen}" class="card-img-top p-2" style="height: 100px; object-fit: contain;">`
                            : `<div class="text-center p-3 text-muted"><i class="bi bi-image fs-1"></i></div>`;

                        let html = `
                            <div class="col-md-6 col-lg-4">
                                <div class="card product-card h-100 shadow-sm border-0" onclick='agregarAlCarrito(${JSON.stringify(p)})'>
                                    ${imgHtml}
                                    <div class="card-body text-center p-2">
                                        <div class="badge bg-secondary mb-1">${p.codigo}</div>
                                        <h6 class="card-title text-truncate small fw-bold mb-1">${p.nombre}</h6>
                                        <h5 class="text-danger mb-0">S/ ${p.precio.toFixed(2)}</h5>
                                        <small class="text-muted">Stock: ${p.stock}</small>
                                    </div>
                                </div>
                            </div>
                        `;
                        contenedor.append(html);
                    });
                } else {
                    contenedor.html('<div class="col-12 text-center text-danger mt-4">No se encontraron productos coincidentes.</div>');
                }
            });
    });

    // --- LÓGICA DEL CARRITO ---
    window.agregarAlCarrito = function(producto) {
        if (producto.stock <= 0) {
            Swal.fire('Sin Stock', 'Este producto no tiene unidades disponibles.', 'warning');
            return;
        }

        const existente = carrito.find(i => i.id === producto.id);
        if (existente) {
            if (existente.cantidad < producto.stock) {
                existente.cantidad++;
            } else {
                Swal.fire('Límite', 'Has alcanzado el máximo de stock disponible.', 'warning');
                return;
            }
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }

        $('#inputBuscarProducto').val('').trigger('keyup');
        renderizarCarrito();
    };

    window.cambiarCantidad = function(id, delta) {
        const item = carrito.find(i => i.id === id);
        if (item) {
            let nueva = item.cantidad + delta;
            if (nueva > 0 && nueva <= item.stock) {
                item.cantidad = nueva;
            } else if (nueva <= 0) {
                eliminarDelCarrito(id);
                return;
            } else {
                Swal.fire('Stock insuficiente', 'No hay más unidades.', 'warning');
            }
        }
        renderizarCarrito();
    };

    window.eliminarDelCarrito = function(id) {
        carrito = carrito.filter(i => i.id !== id);
        renderizarCarrito();
    };

    function renderizarCarrito() {
        const tbody = $('#tablaCarrito tbody');
        tbody.empty();

        if (carrito.length === 0) {
            tbody.html('<tr><td colspan="4" class="text-center text-muted py-4">El carrito está vacío</td></tr>');
        } else {
            carrito.forEach(item => {
                let totalItem = item.precio * item.cantidad;
                tbody.append(`
                    <tr>
                        <td>
                            <div class="fw-bold small text-truncate" style="max-width: 140px;">${item.nombre}</div>
                            <small class="text-muted">S/ ${item.precio.toFixed(2)}</small>
                        </td>
                        <td>
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary px-2" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                                <input type="text" class="form-control text-center px-0 bg-white" value="${item.cantidad}" readonly>
                                <button class="btn btn-outline-secondary px-2" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                            </div>
                        </td>
                        <td class="text-end fw-bold">S/ ${totalItem.toFixed(2)}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-link text-danger p-0" onclick="eliminarDelCarrito('${item.id}')"><i class="bi bi-x-circle-fill fs-5"></i></button>
                        </td>
                    </tr>
                `);
            });
        }
        calcularTotales();
    }

    function calcularTotales() {
        let total = 0;
        let gravadas = 0;
        let igv = 0;

        carrito.forEach(item => {
            let subtotal = item.precio * item.cantidad;
            let valorUnitario = item.precio / (1 + TASA_IGV);
            let baseItem = valorUnitario * item.cantidad;

            total += subtotal;
            gravadas += baseItem;
            igv += (subtotal - baseItem);
        });

        $('#lblOpGravadas').text(gravadas.toFixed(2));
        $('#lblIgv').text(igv.toFixed(2));
        $('#lblTotal').text(total.toFixed(2));
    }

    // --- PROCESAR VENTA FINAL ---
    $('#btnCobrar').click(function() {
        if (carrito.length === 0) {
            Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');
            return;
        }

        const tipoDoc = $('#tipoDoc').val();
        const numDoc = $('#numDoc').val().trim();
        const nombre = $('#nombreCliente').val().trim();
        const direccion = $('#direccionCliente').val().trim();

        // Validaciones de negocio y SUNAT
        if (tipoDoc === '1' && numDoc.length !== 8) {
            Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
            return;
        }
        if (tipoDoc === '6' && numDoc.length !== 11) {
            Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
            return;
        }
        if (!nombre) {
            Swal.fire('Cliente requerido', 'Ingresa o busca el nombre del cliente.', 'warning');
            return;
        }
        if (tipoDoc === '6' && !direccion) {
            Swal.fire('Dirección requerida', 'Es obligatoria para facturas (RUC).', 'warning');
            return;
        }

        // Armado del JSON para Miapicloud
        let itemsApi = carrito.map(item => {
            let valorUnit = item.precio / (1 + TASA_IGV);
            let base = valorUnit * item.cantidad;
            let igvItem = (item.precio * item.cantidad) - base;

            return {
                "codProducto": item.codigo,
                "descripcion": item.nombre,
                "unidad": "NIU",
                "cantidad": item.cantidad,
                "mtoBaseIgv": parseFloat(base.toFixed(2)),
                "mtoValorUnitario": parseFloat(valorUnit.toFixed(2)),
                "mtoPrecioUnitario": parseFloat(item.precio.toFixed(2)),
                "codeAfect": "10",
                "igvPorcent": 18,
                "igv": parseFloat(igvItem.toFixed(2))
            };
        });

        const payload = {
            "cliente": {
                "codigoPais": "PE",
                "tipoDoc": tipoDoc,
                "numDoc": numDoc,
                "rznSocial": nombre,
                "direccion": direccion || "-"
            },
            "comprobante": {
                "tipoOperacion": "0101",
                "tipoDoc": tipoDoc === '6' ? "01" : "03",
                "tipoMoneda": "PEN",
                "tipoPago": "Contado",
                "observacion": "Generado desde POS HatunVet"
            },
            "items": itemsApi
        };

        const btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Procesando...');

        fetch('/ventas/api/procesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.success && data.miapicloud && data.miapicloud.respuesta && data.miapicloud.respuesta.success) {
                const res = data.miapicloud.respuesta;

                Swal.fire({
                    title: '¡Venta Realizada!',
                    text: 'Comprobante emitido correctamente.',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: '<i class="bi bi-printer"></i> Ticket',
                    cancelButtonText: '<i class="bi bi-file-earmark-pdf"></i> A4',
                    confirmButtonColor: '#0A3D91',
                    cancelButtonColor: '#D32F2F',
                    allowOutsideClick: false
                }).then((choice) => {
                    if (choice.isConfirmed) {
                        window.open(res['pdf-ticket'], '_blank');
                    } else if (choice.dismiss === Swal.DismissReason.cancel) {
                        window.open(res['pdf-a4'], '_blank');
                    }

                    // Limpieza para nueva venta
                    carrito = [];
                    renderizarCarrito();
                    $('#numDoc, #nombreCliente, #direccionCliente').val('');
                });
            } else {
                Swal.fire('Error', data.message || 'La API rechazó el comprobante.', 'error');
            }
        })
        .catch(err => {
            Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error');
            console.error(err);
        })
        .finally(() => {
            btn.prop('disabled', false).html('<i class="bi bi-receipt me-2"></i> Procesar Venta');
        });
    });

    renderizarCarrito();
});