function renderizarCarrito() {
    aplicarPromociones();

    const lista = $('#listaCarrito');
    lista.empty();

    actualizarContadorCarrito();

    if (carrito.length === 0) {
        lista.html(`
            <div class="carrito-vacio">
                <i class="bi bi-cart3"></i>
                El carrito está vacío
            </div>
        `);
        calcularTotales();
        return;
    }

    carrito.forEach(item => {
        lista.append(renderItemCarrito(item));
    });

    calcularTotales();
}

function actualizarContadorCarrito() {
    const cantidad = carrito.reduce((a, i) => a + i.cantidad, 0);

    $('#carritoCount').text(
        carrito.length === 0 ? '0 items' : `${cantidad} items`
    );
}

function renderItemCarrito(item) {
    const totalItem = item.precio * item.cantidad;

    return `
        <div class="carrito-item">
            <div class="item-thumb">
                ${renderImagenItemCarrito(item)}
            </div>

            <div class="item-info">
                <div class="item-nombre">${item.nombre}</div>
                ${renderPromoItemCarrito(item)}
                ${renderPrecioItemCarrito(item)}
            </div>

            <div class="item-qty">
                <button class="qty-btn" onclick="cambiarCantidad('${item.id}', -1)">−</button>
                <span class="qty-num">${item.cantidad}</span>
                <button class="qty-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
            </div>

            <div class="item-total">
                S/ ${totalItem.toFixed(2)}
            </div>

            <button class="item-del" onclick="eliminarDelCarrito('${item.id}')">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    `;
}

function renderImagenItemCarrito(item) {
    return item.imagen
        ? `<img src="/uploads/${item.imagen}" alt="">`
        : '<i class="bi bi-box-seam"></i>';
}

function renderPromoItemCarrito(item) {
    if (!item.promoNombre) return '';

    return `
        <div class="small text-success fw-bold" style="font-size:11px;">
            <i class="bi bi-tag-fill me-1"></i>
            ${item.promoNombre}
        </div>
    `;
}

function renderPrecioItemCarrito(item) {
    if (item.esServicio) {
        return `
            <div class="item-precio-unit d-flex align-items-center gap-1">
                S/
                <input type="number"
                    class="form-control form-control-sm px-1 py-0"
                    style="width:70px;height:24px;text-align:right;"
                    value="${item.precio}"
                    onchange="cambiarPrecio('${item.id}', this.value)"
                    min="0"
                    step="0.5">
                c/u
            </div>
        `;
    }

    return `
        <div class="item-precio-unit">
            S/ ${item.precio.toFixed(2)} c/u
        </div>
    `;
}