function cargarPromocionesActivas() {
    fetch('/promociones/api/activas')
        .then(r => r.json())
        .then(data => promocionesActivas = data || []);
}

function aplicarPromociones() {
    resetearPromocionesCarrito();
    carrito = carrito.filter(item => !item.isPromoGift);
    aplicarPromocionesPorProductoYCategoria();
    aplicarPromocionesGenerales();
    aplicarPromocionesCompraMinima();
}

function resetearPromocionesCarrito() {
    carrito.forEach(item => {
        if (item.precioOriginal === undefined) item.precioOriginal = item.precio;
        if (!item.isCitaImported && !item.isGroomingImported) item.precio = item.precioOriginal;
        item.descuentoAplicado = 0;
        item.promoNombre = '';
    });
}

function aplicarPromocionesPorProductoYCategoria() {
    promocionesActivas.forEach(promo => {
        if (promo.estado !== 'ACTIVO') return;
        if (promo.tipo === 'CATEGORIA') aplicarPromoCategoria(promo);
        if (promo.tipo === 'PORCENTUAL') aplicarPromoPorcentual(promo);
        if (promo.tipo === 'MONTO_FIJO') aplicarPromoMontoFijo(promo);
        if (promo.tipo === 'PROMO_2X1') aplicarPromoNxM(promo, 2);
        if (promo.tipo === 'PROMO_3X2') aplicarPromoNxM(promo, 3);
        if (promo.tipo === 'REGALO') aplicarPromoRegalo(promo);
    });
}

function aplicarPromoCategoria(promo) {
    if (!promo.categoria) return;
    carrito.forEach(item => {
        // Excluimos ítems importados de citas/grooming, que ya tienen precio propio.
        if (item.isCitaImported || item.isGroomingImported) return;
        if (item.categoria && item.categoria.id === promo.categoria.id) {
            aplicarDescuentoPorcentaje(item, promo);
        }
    });
}

function aplicarPromoPorcentual(promo) {
    carrito.forEach(item => {
        if (promoAplicaAItem(promo, item)) aplicarDescuentoPorcentaje(item, promo);
    });
}

function aplicarPromoMontoFijo(promo) {
    carrito.forEach(item => {
        if (!promoAplicaAItem(promo, item)) return;
        const desc = parseFloat(promo.valor);
        item.precio = Math.max(0, item.precioOriginal - desc);
        item.descuentoAplicado = desc;
        item.promoNombre = promo.nombre;
    });
}

// NOTA: si promo.producto y promo.categoria vienen ambos vacíos/nulos, la promoción
// PORCENTUAL/MONTO_FIJO se considera "general por producto" y se aplica a TODOS
// los productos del carrito individualmente (excepto ítems importados). Esto es
// distinto al tipo GENERAL (ver abajo), que descuenta un % sobre el TOTAL del
// pedido en una sola línea, sin tocar el precio de cada producto.
function promoAplicaAItem(promo, item) {
    if (promo.producto) {
        return item.id === promo.producto.id || item.codigo === promo.producto.codigo;
    }
    return !promo.categoria && !item.isCitaImported && !item.isGroomingImported;
}

function aplicarDescuentoPorcentaje(item, promo) {
    const desc = item.precioOriginal * (parseFloat(promo.valor) / 100);
    item.precio = Math.max(0, item.precioOriginal - desc);
    item.descuentoAplicado = desc;
    item.promoNombre = promo.nombre;
}

function aplicarPromoNxM(promo, cantidadBase) {
    if (!promo.producto) return;
    carrito.forEach(item => {
        if (!(item.id === promo.producto.id || item.codigo === promo.producto.codigo)) return;
        if (item.cantidad < cantidadBase) return;

        const gratis = Math.floor(item.cantidad / cantidadBase);
        item.precio = ((item.cantidad - gratis) * item.precioOriginal) / item.cantidad;
        item.promoNombre = `${promo.nombre} (${gratis} gratis)`;
    });
}

function aplicarPromoRegalo(promo) {
    if (!promo.producto || !promo.productoRegalo) return;

    const itemBase = carrito.find(i =>
        i.id === promo.producto.id || i.codigo === promo.producto.codigo
    );

    if (!itemBase) return;

    carrito.push(crearItemRegaloPromo(promo, itemBase.cantidad));
}

function crearItemRegaloPromo(promo, cantidad) {
    return {
        id: `REGALO-${promo.id}-${promo.productoRegalo.id}`,
        codigo: promo.productoRegalo.codigo,
        nombre: `REGALO: ${promo.productoRegalo.nombre} (${promo.nombre})`,
        precio: 0,
        precioOriginal: parseFloat(promo.productoRegalo.precio),
        cantidad: cantidad,
        stock: 9999,
        imagen: promo.productoRegalo.imagen,
        esServicio: promo.productoRegalo.esServicio,
        isPromoGift: true
    };
}

// ───────────────────────────────────────────────────────────
// PROMO GENERAL: descuento porcentual sobre el TOTAL del pedido
// (no producto por producto). Se muestra como una sola línea de
// descuento en el carrito, similar a la de Compra Mínima.
// ───────────────────────────────────────────────────────────
function aplicarPromocionesGenerales() {
    promocionesActivas.forEach(promo => {
        if (promo.estado !== 'ACTIVO' || promo.tipo !== 'GENERAL') return;
        aplicarDescuentoGeneralAlTotal(promo);
    });
}

function aplicarDescuentoGeneralAlTotal(promo) {
    // Base de cálculo: los productos/servicios "normales" del carrito, ya con los
    // descuentos por producto/categoría/2x1 aplicados (si los hubiera). Se excluyen
    // los cargos importados de citas médicas o grooming (tienen precio propio) y
    // cualquier línea de regalo/descuento generada por otra promoción.
    const baseCalculo = carrito
        .filter(item => !item.isCitaImported && !item.isGroomingImported && !item.isPromoGift)
        .reduce((total, item) => total + (item.precio * item.cantidad), 0);

    if (baseCalculo <= 0) return;

    const porcentaje = parseFloat(promo.valor) || 0;
    if (porcentaje <= 0) return;

    const montoDescuento = parseFloat((baseCalculo * (porcentaje / 100)).toFixed(2));

    if (montoDescuento <= 0) return;

    carrito.push(crearItemDescuentoGeneral(promo, montoDescuento));
}

function crearItemDescuentoGeneral(promo, monto) {
    return {
        id: `DESCUENTO-GENERAL-${promo.id}`,
        codigo: 'DSC-GEN',
        nombre: `${promo.nombre} (${parseFloat(promo.valor).toFixed(0)}% sobre el total)`,
        precio: -monto,
        precioOriginal: -monto,
        cantidad: 1,
        stock: 9999,
        imagen: null,
        esServicio: false,
        isPromoGift: true
    };
}

function aplicarPromocionesCompraMinima() {
    const subtotalActual = obtenerTotalCarrito();

    promocionesActivas.forEach(promo => {
        if (promo.estado !== 'ACTIVO' || promo.tipo !== 'COMPRA_MINIMA') return;
        if (subtotalActual < parseFloat(promo.compraMinima)) return;

        if (promo.valor > 0) carrito.push(crearItemDescuentoCompraMinima(promo));
        if (promo.productoRegalo) carrito.push(crearItemRegaloCompraMinima(promo));
    });
}

function crearItemDescuentoCompraMinima(promo) {
    return {
        id: `DESCUENTO-${promo.id}`,
        codigo: 'DSC-001',
        nombre: `Dscto: ${promo.nombre}`,
        precio: -parseFloat(promo.valor),
        precioOriginal: -parseFloat(promo.valor),
        cantidad: 1,
        stock: 9999,
        imagen: null,
        esServicio: true,
        isPromoGift: true
    };
}

function crearItemRegaloCompraMinima(promo) {
    return {
        id: `REGALO-COMPRA-${promo.id}-${promo.productoRegalo.id}`,
        codigo: promo.productoRegalo.codigo,
        nombre: `Regalo Compra: ${promo.productoRegalo.nombre} (${promo.nombre})`,
        precio: 0,
        precioOriginal: parseFloat(promo.productoRegalo.precio),
        cantidad: 1,
        stock: 9999,
        imagen: promo.productoRegalo.imagen,
        esServicio: promo.productoRegalo.esServicio,
        isPromoGift: true
    };
}