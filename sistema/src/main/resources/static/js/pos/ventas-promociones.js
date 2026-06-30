function cargarPromocionesActivas() {
    fetch('/promociones/api/activas')
        .then(r => r.json())
        .then(data => promocionesActivas = data || []);
}

function aplicarPromociones() {
    resetearPromocionesCarrito();
    carrito = carrito.filter(item => !item.isPromoGift);
    aplicarPromocionesPorProductoYCategoria();
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
        nombre: `🎁 REGALO: ${promo.productoRegalo.nombre} (${promo.nombre})`,
        precio: 0,
        precioOriginal: parseFloat(promo.productoRegalo.precio),
        cantidad: cantidad,
        stock: 9999,
        imagen: promo.productoRegalo.imagen,
        esServicio: promo.productoRegalo.esServicio,
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
        nombre: `🏷️ Dscto: ${promo.nombre}`,
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
        nombre: `🎁 Regalo Compra: ${promo.productoRegalo.nombre} (${promo.nombre})`,
        precio: 0,
        precioOriginal: parseFloat(promo.productoRegalo.precio),
        cantidad: 1,
        stock: 9999,
        imagen: promo.productoRegalo.imagen,
        esServicio: promo.productoRegalo.esServicio,
        isPromoGift: true
    };
}