function iniciarCarritoPOS() {
    window.agregarAlCarrito = agregarAlCarrito;
    window.cambiarCantidad = cambiarCantidad;
    window.cambiarPrecio = cambiarPrecio;
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.anularOrden = anularOrden;
}

function anularOrden() {
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
        if (r.isConfirmed) resetearPOSVenta();
    });
}

function agregarAlCarrito(producto) {
    if (!producto.esServicio && producto.stock <= 0) {
        Swal.fire('Sin Stock', 'Este producto no tiene unidades disponibles.', 'warning');
        return;
    }

    const existente = carrito.find(i => i.id === producto.id);

    if (existente) {
        aumentarItemCarrito(existente, producto);
        return;
    }

    carrito.push({ ...producto, cantidad: 1 });
    renderizarCarrito();
}

function aumentarItemCarrito(item, producto) {
    if (producto.esServicio || item.cantidad < producto.stock) {
        item.cantidad++;
        renderizarCarrito();
        return;
    }

    Swal.fire('Límite', 'Has alcanzado el máximo de stock disponible.', 'warning');
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => String(i.id) === String(id));
    if (!item) return;

    const nueva = item.cantidad + delta;

    if (nueva <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    if (!item.esServicio && nueva > item.stock) {
        Swal.fire('Stock insuficiente', 'No hay más unidades.', 'warning');
        return;
    }

    item.cantidad = nueva;
    renderizarCarrito();
}

function cambiarPrecio(id, nuevoPrecio) {
    const item = carrito.find(i => String(i.id) === String(id));
    if (!item) return;

    item.precio = Math.max(0, parseFloat(nuevoPrecio) || 0);
    item.precioOriginal = item.precio;

    renderizarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => String(i.id) !== String(id));
    renderizarCarrito();
}