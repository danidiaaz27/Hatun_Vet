function iniciarBuscadorProductos() {
    $('#inputBuscarProducto').on('keyup', buscarProductosVenta);
}

function buscarProductosVenta() {
    const termino = $(this).val();
    const contenedor = $('#resultadosBusqueda');

    if (termino.length < 2) {
        mostrarEstadoInicialProductos(contenedor);
        return;
    }

    fetch(`/ventas/api/buscar-producto?termino=${encodeURIComponent(termino)}`)
        .then(r => r.json())
        .then(res => renderResultadosProductos(res, contenedor));
}

function mostrarEstadoInicialProductos(contenedor) {
    contenedor.html(`
        <div class="productos-empty">
            <i class="bi bi-box-seam"></i>
            Busca un producto para empezar a vender
        </div>
    `);
}

function renderResultadosProductos(res, contenedor) {
    contenedor.empty();

    if (res.success && res.data.length > 0) {
        res.data.forEach(p => contenedor.append(renderProductoVenta(p)));
        return;
    }

    contenedor.html(`
        <div class="productos-empty">
            <i class="bi bi-search"></i>
            No se encontraron productos.
        </div>
    `);
}

function renderProductoVenta(producto) {
    const productoJson = JSON.stringify(producto).replace(/"/g, '&quot;');

    return `
        <div class="product-card" onclick='agregarAlCarrito(${JSON.stringify(producto)})'>
            <div class="product-card-img">
                ${renderImagenProductoVenta(producto)}
            </div>

            <div class="product-card-body">
                ${renderBadgeStockProducto(producto)}

                <div class="product-nombre">
                    ${producto.nombre}
                </div>

                <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="product-precio">
                        S/ ${producto.precio.toFixed(2)}
                    </span>
                    <span class="product-stock-txt">
                        Q: ${producto.stock}
                    </span>
                </div>

                <button class="btn-agregar"
                    onclick="event.stopPropagation(); agregarAlCarrito(${productoJson})">
                    <i class="bi bi-cart-plus"></i>
                    Agregar
                </button>
            </div>
        </div>
    `;
}

function renderImagenProductoVenta(producto) {
    return producto.imagen
        ? `<img src="/uploads/${producto.imagen}" alt="${producto.nombre}">`
        : '<i class="bi bi-box-seam no-img"></i>';
}

function renderBadgeStockProducto(producto) {
    if (producto.stock <= 0) {
        return '<span class="product-badge badge-agotado">Agotado</span>';
    }

    if (producto.stock <= 5) {
        return '<span class="product-badge badge-pocas">Pocas unidades</span>';
    }

    return '<span class="product-badge badge-stock">En Stock</span>';
}