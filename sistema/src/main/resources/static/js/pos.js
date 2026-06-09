$(document).ready(function() {
    let carrito = [];
    const TASA_IGV = 0.18;
    let modalCitasCobro = new bootstrap.Modal(document.getElementById('modalCitasCobro'));

    // --- RELOJ ---
    setInterval(() => { $('#relojActual').text(new Date().toLocaleTimeString('es-PE')); }, 1000);

    // --- MÉTODO DE PAGO (select) ---
    // Se lee directamente con $('#metodoPago').val()

    // --- ANULAR ORDEN ---
    window.anularOrden = function() {
        if (carrito.length === 0) return;
        Swal.fire({
            title: '¿Anular orden?',
            text: 'Se vaciará el carrito y los datos del cliente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#6b7a99',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        }).then(r => {
            if (r.isConfirmed) {
                carrito = [];
                $('#numDoc, #nombreCliente').val('');
                $('#tipoDoc').val('1');
                $('#metodoPago').val('efectivo');
                renderizarCarrito();
            }
        });
    };

    // --- VALIDACIONES DE DOCUMENTOS ---
    $('#numDoc').on('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); });

    $('#tipoDoc').change(function() {
        const tipo = $(this).val();
        $('#numDoc').val('').attr('maxlength', tipo === '1' ? '8' : '11')
                            .attr('placeholder', tipo === '1' ? 'DNI (8 dígitos)' : 'RUC (11 dígitos)');
        $('#nombreCliente').val('');
    });
    $('#tipoDoc').trigger('change');

    // --- BUSCAR CLIENTE ---
    $('#btnBuscarDoc').click(function() {
        const tipoDoc = $('#tipoDoc').val();
        const numDoc  = $('#numDoc').val().trim();

        if (tipoDoc === '1' && numDoc.length !== 8)  return Swal.fire('Atención', 'El DNI debe tener 8 dígitos.', 'warning');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('Atención', 'El RUC debe tener 11 dígitos.', 'warning');
        if (tipoDoc === '6') {
            const pref = numDoc.substring(0, 2);
            if (!['10','15','17','20'].includes(pref)) return Swal.fire('RUC Inválido', 'El RUC debe empezar con 10, 15, 17 o 20.', 'error');
        }

        const btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    if (tipoDoc === '1') {
                        let nombre = info.nombre_completo || `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`.trim();
                        $('#nombreCliente').val(nombre);
                    } else {
                        $('#nombreCliente').val(info.nombre_o_razon_social || info.razon_social || info.razonSocial);
                    }
                } else {
                    Swal.fire('Información', res.message || 'No se encontraron datos.', 'info');
                    $('#nombreCliente').val('');
                }
            })
            .catch(() => Swal.fire('Error', 'Fallo al consultar documento.', 'error'))
            .finally(() => btn.prop('disabled', false).html('<i class="bi bi-search"></i>'));
    });

    // --- BUSCADOR DE PRODUCTOS ---
    $('#inputBuscarProducto').on('keyup', function() {
        const termino = $(this).val();
        const contenedor = $('#resultadosBusqueda');

        if (termino.length < 2) {
            contenedor.html('<div class="productos-empty"><i class="bi bi-box-seam"></i>Busca un producto para empezar a vender</div>');
            return;
        }

        fetch(`/ventas/api/buscar-producto?termino=${encodeURIComponent(termino)}`)
            .then(r => r.json())
            .then(res => {
                contenedor.empty();
                if (res.success && res.data.length > 0) {
                    res.data.forEach(p => {
                        const badgeStock = p.stock <= 0
                            ? '<span class="product-badge badge-agotado">Agotado</span>'
                            : p.stock <= 5
                                ? '<span class="product-badge badge-pocas">Pocas unidades</span>'
                                : '<span class="product-badge badge-stock">En Stock</span>';

                        const imgHtml = p.imagen
                            ? `<img src="/uploads/${p.imagen}" alt="${p.nombre}">`
                            : `<i class="bi bi-box-seam no-img"></i>`;

                        const card = `
                            <div class="product-card" onclick='agregarAlCarrito(${JSON.stringify(p)})'>
                                <div class="product-card-img">${imgHtml}</div>
                                <div class="product-card-body">
                                    ${badgeStock}
                                    <div class="product-nombre">${p.nombre}</div>
                                    <div class="d-flex justify-content-between align-items-center mt-1">
                                        <span class="product-precio">S/ ${p.precio.toFixed(2)}</span>
                                        <span class="product-stock-txt">Q: ${p.stock}</span>
                                    </div>
                                    <button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                        <i class="bi bi-cart-plus"></i> Agregar
                                    </button>
                                </div>
                            </div>`;
                        contenedor.append(card);
                    });
                } else {
                    contenedor.html('<div class="productos-empty"><i class="bi bi-search"></i>No se encontraron productos.</div>');
                }
            });
    });

    // --- LÓGICA DEL CARRITO ---
    window.agregarAlCarrito = function(producto) {
        if (producto.stock <= 0) { Swal.fire('Sin Stock', 'Este producto no tiene unidades disponibles.', 'warning'); return; }

        const existente = carrito.find(i => i.id === producto.id);
        if (existente) {
            if (existente.cantidad < producto.stock) existente.cantidad++;
            else { Swal.fire('Límite', 'Has alcanzado el máximo de stock disponible.', 'warning'); return; }
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        renderizarCarrito();
    };

    window.cambiarCantidad = function(id, delta) {
        const item = carrito.find(i => i.id === id);
        if (!item) return;
        const nueva = item.cantidad + delta;
        if (nueva <= 0) { eliminarDelCarrito(id); return; }
        if (nueva > item.stock) { Swal.fire('Stock insuficiente', 'No hay más unidades.', 'warning'); return; }
        item.cantidad = nueva;
        renderizarCarrito();
    };

    window.eliminarDelCarrito = function(id) {
        carrito = carrito.filter(i => i.id !== id);
        renderizarCarrito();
    };

    function renderizarCarrito() {
        const lista = $('#listaCarrito');
        lista.empty();

        $('#carritoCount').text(carrito.length === 0 ? '0 items' : `${carrito.reduce((a,i) => a + i.cantidad, 0)} items`);

        if (carrito.length === 0) {
            lista.html('<div class="carrito-vacio"><i class="bi bi-cart3"></i>El carrito está vacío</div>');
        } else {
            carrito.forEach(item => {
                const totalItem = item.precio * item.cantidad;
                const imgHtml = item.imagen
                    ? `<img src="/uploads/${item.imagen}" alt="">`
                    : `<i class="bi bi-box-seam"></i>`;

                lista.append(`
                    <div class="carrito-item">
                        <div class="item-thumb">${imgHtml}</div>
                        <div class="item-info">
                            <div class="item-nombre">${item.nombre}</div>
                            <div class="item-precio-unit">S/ ${item.precio.toFixed(2)} c/u</div>
                        </div>
                        <div class="item-qty">
                            <button class="qty-btn" onclick="cambiarCantidad('${item.id}', -1)">−</button>
                            <span class="qty-num">${item.cantidad}</span>
                            <button class="qty-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                        </div>
                        <div class="item-total">S/ ${totalItem.toFixed(2)}</div>
                        <button class="item-del" onclick="eliminarDelCarrito('${item.id}')"><i class="bi bi-x-lg"></i></button>
                    </div>
                `);
            });
        }
        calcularTotales();
    }

    function calcularTotales() {
        let total = 0, gravadas = 0, igv = 0;
        carrito.forEach(item => {
            const subtotal     = item.precio * item.cantidad;
            const valorUnit    = item.precio / (1 + TASA_IGV);
            const base         = valorUnit * item.cantidad;
            total    += subtotal;
            gravadas += base;
            igv      += subtotal - base;
        });
        $('#lblOpGravadas').text(gravadas.toFixed(2));
        $('#lblIgv').text(igv.toFixed(2));
        $('#lblTotal').text(total.toFixed(2));
    }

    // --- IMPORTAR CITAS MÉDICAS ---
    window.abrirModalCitasCobro = function() {
        fetch('/api/citas/por-cobrar')
            .then(r => r.json())
            .then(citas => {
                const lista = $('#listaCitasPorCobrar');
                lista.empty();
                if (citas.length === 0) {
                    lista.html('<div class="text-center text-muted p-4">No hay citas finalizadas pendientes de cobro.</div>');
                    modalCitasCobro.show();
                    return;
                }
                citas.forEach(c => {
                    const btn = $(`
                        <div class="card-custom mb-2 p-3" style="cursor:pointer; background:#fff; border-radius:12px; border:1.5px solid rgba(10,61,145,0.10);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold">🐾 ${c.mascota} <span class="badge" style="background:#fce8e8; color:#b71c1c; border-radius:50px; padding:3px 10px; font-size:11px;">S/ ${c.total.toFixed(2)}</span></div>
                                    <small class="text-muted"><i class="bi bi-person me-1"></i>${c.clienteNombre} · ${c.clienteDocumento}</small>
                                    <small class="d-block" style="color: var(--vet-blue)"><i class="bi bi-list-check me-1"></i>${c.detalles.length} ítems en la cuenta médica</small>
                                </div>
                                <i class="bi bi-box-arrow-in-right fs-4 text-muted"></i>
                            </div>
                        </div>
                    `);
                    btn.click(() => { importarCitaDirecta(c); modalCitasCobro.hide(); });
                    lista.append(btn);
                });
                modalCitasCobro.show();
            });
    };

    function importarCitaDirecta(citaData) {
        const isRuc = citaData.clienteDocumento.length === 11;
        $('#tipoDoc').val(isRuc ? '6' : '1').trigger('change');
        $('#numDoc').val(citaData.clienteDocumento);
        $('#nombreCliente').val(citaData.clienteNombre);

        citaData.detalles.forEach((item, index) => {
            const servicio = {
                id: item.idProducto || ('CITA-' + citaData.citaId + '-' + index),
                codigo: item.tipo === 'SERVICIO' ? 'CM-001' : 'INS-001',
                nombre: item.descripcion,
                precio: parseFloat(item.precio),
                cantidad: parseInt(item.cantidad),
                stock: 9999,
                imagen: null
            };
            const existente = carrito.find(i => i.id === servicio.id);
            if (existente) existente.cantidad += servicio.cantidad;
            else carrito.push(servicio);
        });

        renderizarCarrito();
        Swal.fire({ icon: 'success', title: 'Cuenta Médica Importada', text: `Gastos de ${citaData.mascota} transferidos al carrito.`, timer: 2000, showConfirmButton: false });
    }

    // --- PROCESAR VENTA ---
    $('#btnCobrar').click(function() {
        if (carrito.length === 0) return Swal.fire('Carrito vacío', 'Agrega al menos un producto.', 'warning');

        const tipoDoc  = $('#tipoDoc').val();
        const numDoc   = $('#numDoc').val().trim();
        const nombre   = $('#nombreCliente').val().trim();
        const metodo   = $('#metodoPago').val() || 'efectivo';

        if (tipoDoc === '1' && numDoc.length !== 8) return Swal.fire('DNI Inválido', 'Debe tener 8 dígitos.', 'error');
        if (tipoDoc === '6' && numDoc.length !== 11) return Swal.fire('RUC Inválido', 'Debe tener 11 dígitos.', 'error');
        if (!nombre) return Swal.fire('Cliente requerido', 'Ingresa el nombre del cliente.', 'warning');

        let itemsApi = carrito.map(item => {
            const valorUnit = item.precio / (1 + TASA_IGV);
            const base      = valorUnit * item.cantidad;
            const igvItem   = (item.precio * item.cantidad) - base;
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
        });

        const payload = {
            cliente: { codigoPais: 'PE', tipoDoc, numDoc, rznSocial: nombre, direccion: '-' },
            comprobante: {
                tipoOperacion: '0101',
                tipoDoc: tipoDoc === '6' ? '01' : '03',
                tipoMoneda: 'PEN',
                tipoPago: metodo === 'yape' ? 'Yape' : 'Contado',
                observacion: 'Generado desde POS HatunVet'
            },
            items: itemsApi
        };

        const btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span> Procesando...');

        fetch('/ventas/api/procesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(data => {
            if (data.success && data.miapicloud?.respuesta?.success) {
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
                }).then(choice => {
                    if (choice.isConfirmed) window.open(res['pdf-ticket'], '_blank');
                    else if (choice.dismiss === Swal.DismissReason.cancel) window.open(res['pdf-a4'], '_blank');
                    carrito = [];
                    $('#numDoc, #nombreCliente').val('');
                    $('#metodoPago').val('efectivo');
                    renderizarCarrito();
                });
            } else {
                Swal.fire('Error', data.message || 'La API o SUNAT rechazó el comprobante.', 'error');
            }
        })
        .catch(() => Swal.fire('Error de Red', 'No se pudo comunicar con el servidor.', 'error'))
        .finally(() => btn.prop('disabled', false).html('<i class="bi bi-receipt me-2"></i> FINALIZAR VENTA'));
    });

    renderizarCarrito();
});