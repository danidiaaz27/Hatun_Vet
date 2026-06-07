$(document).ready(function() {
    let carrito = [];
    let citaIdImportada = null;
    const TASA_IGV = 0.18;
    
    // Inicializar Modal de Citas
    let modalCitasCobro = new bootstrap.Modal(document.getElementById('modalCitasCobro'));

    // --- RELOJ EN TIEMPO REAL ---
    setInterval(() => {
        $('#relojActual').text(new Date().toLocaleTimeString('es-PE'));
    }, 1000);

    // --- VALIDACIONES DE DOCUMENTOS ---
    $('#numDoc').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $('#tipoDoc').change(function() {
        const tipo = $(this).val();
        $('#numDoc').val('');
        $('#nombreCliente').val('');
        $('#direccionCliente').val('');

        if (tipo === '1') {
            $('#numDoc').attr('maxlength', '8').attr('placeholder', 'DNI (8 dígitos)');
        } else {
            $('#numDoc').attr('maxlength', '11').attr('placeholder', 'RUC (11 dígitos)');
        }
    });
    $('#tipoDoc').trigger('change');

    // --- BUSCAR CLIENTE EN API ---
    $('#btnBuscarDoc').click(function() {
        const tipoDoc = $('#tipoDoc').val();
        const numDoc = $('#numDoc').val().trim();

        if (tipoDoc === '1' && numDoc.length !== 8) return Swal.fire('Atención', 'El DNI debe tener 8 dígitos.', 'warning');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('Atención', 'El RUC debe tener 11 dígitos.', 'warning');

        if (tipoDoc === '6') {
            const prefijo = numDoc.substring(0, 2);
            if (!['10', '15', '17', '20'].includes(prefijo)) {
                return Swal.fire('RUC Inválido', 'El RUC debe empezar con 10, 15, 17 o 20.', 'error');
            }
        }

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm text-primary"></span>');

        fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    if (tipoDoc === '1') {
                        let nombre = info.nombre_completo || `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`.trim();
                        $('#nombreCliente').val(nombre);
                        $('#direccionCliente').val('');
                    } else {
                        $('#nombreCliente').val(info.nombre_o_razon_social || info.razon_social || info.razonSocial);
                        $('#direccionCliente').val(info.direccion_completa || info.direccion || '-');
                    }
                } else {
                    Swal.fire('Información', res.message || 'No se encontraron datos.', 'info');
                    $('#nombreCliente').val('');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al consultar documento.', 'error'))
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
                        let imgHtml = p.imagen ? `<img src="/uploads/${p.imagen}" class="card-img-top p-2" style="height: 100px; object-fit: contain;">` : `<div class="text-center p-3 text-muted"><i class="bi bi-image fs-1"></i></div>`;
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
                    contenedor.html('<div class="col-12 text-center text-danger mt-4">No se encontraron productos.</div>');
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
        let total = 0, gravadas = 0, igv = 0;
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

    // --- NUEVO: IMPORTAR CUENTAS MÉDICAS AL POS ---
    window.abrirModalCitasCobro = function() {
        fetch('/api/citas/por-cobrar')
            .then(r => r.json())
            .then(citas => {
                const lista = $('#listaCitasPorCobrar');
                lista.empty();
                
                if(citas.length === 0) {
                    lista.html('<div class="text-center text-muted p-4">No hay citas médicas finalizadas pendientes de cobro en este momento.</div>');
                    modalCitasCobro.show();
                    return;
                }

                citas.forEach(c => {
                    const btn = $('<button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 mb-2 rounded shadow-sm border-0"></button>');
                    btn.html(`
                        <div>
                            <h6 class="mb-1 fw-bold text-dark">Paciente: ${c.mascota} <span class="badge bg-danger ms-2">Total a cobrar: S/ ${c.total.toFixed(2)}</span></h6>
                            <small class="text-muted d-block"><i class="bi bi-person"></i> Cliente: ${c.clienteNombre} (Doc: ${c.clienteDocumento})</small>
                            <small class="text-primary fw-bold mt-1 d-block"><i class="bi bi-list-check"></i> ${c.detalles.length} ítems en la cuenta médica</small>
                        </div>
                        <i class="bi bi-box-arrow-in-down-right fs-3 text-danger"></i>
                    `);
                    
                    btn.click(function() {
                        importarCitaDirecta(c);
                        modalCitasCobro.hide();
                    });
                    lista.append(btn);
                });
                modalCitasCobro.show();
            });
    };

    function importarCitaDirecta(citaData) {
        citaIdImportada = citaData.citaId;
        // Rellenar tipo de comprobante y documento automáticamente
        const isRuc = citaData.clienteDocumento.length === 11;
        $('#tipoDoc').val(isRuc ? '6' : '1').trigger('change');
        $('#numDoc').val(citaData.clienteDocumento);
        $('#nombreCliente').val(citaData.clienteNombre);
        
        // Cargar los servicios (evadiendo la validación de stock)
        citaData.detalles.forEach((item, index) => {
            const servicioMédico = {
                id: item.idProducto || ('CITA-' + citaData.citaId + '-' + index), 
                codigo: item.tipo === 'SERVICIO' ? 'CM-001' : 'INS-001',
                nombre: item.descripcion,
                precio: parseFloat(item.precio),
                cantidad: parseInt(item.cantidad),
                stock: 9999 // Stock virtual infinito para evitar bloqueo
            };
            
            const existente = carrito.find(i => i.id === servicioMédico.id);
            if (existente) {
                existente.cantidad += servicioMédico.cantidad;
            } else {
                carrito.push(servicioMédico);
            }
        });
        
        renderizarCarrito();
        
        Swal.fire({
            icon: 'success',
            title: 'Cuenta Médica Importada',
            text: `Se han transferido los gastos de ${citaData.mascota} al carrito.`,
            timer: 2000,
            showConfirmButton: false
        });
    }

    // --- PROCESAR VENTA FINAL ---
    $('#btnCobrar').click(function() {
        if (carrito.length === 0) return Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');

        const tipoDoc = $('#tipoDoc').val();
        const numDoc = $('#numDoc').val().trim();
        const nombre = $('#nombreCliente').val().trim();
        const direccion = $('#direccionCliente').val().trim();

        if (tipoDoc === '1' && numDoc.length !== 8) return Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
        if (!nombre) return Swal.fire('Cliente requerido', 'Ingresa el nombre del cliente.', 'warning');
        if (tipoDoc === '6' && !direccion) return Swal.fire('Dirección requerida', 'Obligatoria para facturas.', 'warning');

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
            "items": itemsApi,
            "citaId": citaIdImportada
        };

        const btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Procesando...');
        $('.cart-container button').prop('disabled', true);

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
                    if (choice.isConfirmed) window.open(res['pdf-ticket'], '_blank');
                    else if (choice.dismiss === Swal.DismissReason.cancel) window.open(res['pdf-a4'], '_blank');

                    carrito = [];
                    citaIdImportada = null;
                    renderizarCarrito();
                    $('#numDoc, #nombreCliente, #direccionCliente').val('');
                });
            } else {
                Swal.fire('Error', data.message || 'La API o SUNAT rechazó el comprobante.', 'error');
                $('.cart-container button').prop('disabled', false);
            }
        })
        .catch(err => {
            Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error');
            $('.cart-container button').prop('disabled', false);
        })
        .finally(() => {
            btn.prop('disabled', false).html('<i class="bi bi-receipt me-2"></i> Procesar Venta');
        });
    });

    renderizarCarrito();
});