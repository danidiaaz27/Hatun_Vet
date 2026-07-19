let promociones = [];
let promocionesFiltradas = [];
let paginaActual = 1;
let porPagina = 10;
function cargarPromociones() {
    fetch(`${API_BASE}/listar`)
        .then(r => r.json())
        .then(res => {
            promociones = res.data || [];
            paginaActual = 1;
            renderPromociones();
        });
}
function iniciarVistaCardsPromociones() {
    $('#promoBuscar').on('input', function() {
        paginaActual = 1;
        renderPromociones();
    });
    $('#promoPorPagina').on('change', function() {
        porPagina = parseInt($(this).val());
        paginaActual = 1;
        renderPromociones();
    });

    $('#promoPrev').click(() => {
        if (paginaActual > 1) {
            paginaActual--;
            renderPromociones();
        }
    });

    $('#promoNext').click(() => {
        paginaActual++;
        renderPromociones();
    });
}
function renderPromociones() {
    const grid = $('#promocionesGrid');
    const texto = ($('#promoBuscar').val() || '').toLowerCase().trim();

    promocionesFiltradas = promociones.filter(p =>
        (p.nombre || '').toLowerCase().includes(texto) ||
        (p.tipo || '').toLowerCase().includes(texto)
    );
    const total = promocionesFiltradas.length;
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    const inicio = (paginaActual - 1) * porPagina;
    const fin = Math.min(inicio + porPagina, total);
    const pagina = promocionesFiltradas.slice(inicio, fin);
    grid.empty();
    $('#promoConteo').text(
        total > 0
            ? `Mostrando ${inicio + 1} a ${fin} de ${total} registros`
            : 'Sin registros'
    );
    $('#promoPaginaActual').text(paginaActual);
    $('#promoPrev').prop('disabled', paginaActual <= 1);
    $('#promoNext').prop('disabled', paginaActual >= totalPaginas);

    if (pagina.length === 0) {
        grid.html(`
            <div class="promo-empty">
                <i class="bi bi-tags"></i>
                No hay promociones registradas
            </div>
        `);
        return;
    }
    pagina.forEach(promo => grid.append(renderCardPromocion(promo)));
}
function renderCardPromocion(promo) {
    return `
        <div class="promo-card">
            <div class="promo-card-top">
                <div class="promo-icon ${claseIconoPromo(promo.tipo)}">
                    <i class="bi ${iconoPromo(promo.tipo)}"></i>
                </div>

                <div class="promo-title-wrap">
                    <h5>${promo.nombre || 'Sin nombre'}</h5>
                    ${badgeTipoPromocion(promo.tipo)}
                </div>
            </div>

            <div class="promo-highlight">
                ${valorPrincipalPromo(promo)}
            </div>

            <hr>

            <div class="promo-detail">
                <span>Producto:</span>
                <strong>${textoAmbitoPromo(promo)}</strong>
            </div>

            <div class="promo-detail mt-3">
                <span>Vigencia:</span>
                <strong>
                    <i class="bi bi-calendar3 me-1"></i>
                    ${formatFecha(promo.fechaInicio)} al ${formatFecha(promo.fechaFin)}
                </strong>
            </div>

            <hr>

            <div class="promo-footer">
                <div>
                    <span>Estado:</span>
                    ${badgeEstadoPromo(promo.estado)}
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-light border action-edit text-primary"
                        data-id="${promo.id}" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button class="btn btn-light border action-delete text-danger"
                        data-id="${promo.id}" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
function badgeTipoPromocion(tipo) {
    const map = {
        PORCENTUAL: 'Porcentual',
        MONTO_FIJO: 'Monto Fijo',
        PROMO_2X1: '2x1',
        PROMO_3X2: '3x2',
        COMPRA_MINIMA: 'Compra mínima',
        REGALO: 'Regalo',
        CATEGORIA: 'Categoría',
        GENERAL: 'Descuento General'
    };

    return `<span class="promo-badge">${map[tipo] || tipo}</span>`;
}
function valorPrincipalPromo(promo) {
    if (promo.tipo === 'PORCENTUAL' || promo.tipo === 'CATEGORIA') {
        return `<strong>${parseFloat(promo.valor).toFixed(0)}%</strong>
                <span>de descuento</span>`;
    }

    if (promo.tipo === 'GENERAL') {
        return `<strong>${parseFloat(promo.valor).toFixed(0)}%</strong>
                <span>de descuento sobre el total</span>`;
    }

    if (promo.tipo === 'MONTO_FIJO') {
        return `<strong>S/ ${parseFloat(promo.valor).toFixed(2)}</strong>
                <span>de descuento</span>`;
    }

    if (promo.tipo === 'PROMO_2X1') {
        return `<strong>Paga 1</strong><span>Lleva 2</span>`;
    }

    if (promo.tipo === 'PROMO_3X2') {
        return `<strong>Paga 2</strong><span>Lleva 3</span>`;
    }

    if (promo.tipo === 'COMPRA_MINIMA') {
        return `<strong>S/ ${parseFloat(promo.compraMinima).toFixed(2)}</strong>
                <span>compra mínima</span>`;
    }

    if (promo.tipo === 'REGALO') {
        return `<strong>Gratis</strong><span>producto de regalo</span>`;
    }

    return `<strong>-</strong>`;
}
function textoAmbitoPromo(promo) {
    if (promo.tipo === 'GENERAL') return 'Total del pedido (POS)';
    if (promo.producto) return promo.producto.nombre;
    if (promo.categoria) return promo.categoria.nombre;
    if (promo.productoRegalo) return promo.productoRegalo.nombre;

    return 'Todos los productos';
}
function badgeEstadoPromo(estado) {
    return estado === 'ACTIVO'
        ? '<span class="promo-status activo">Activo</span>'
        : '<span class="promo-status inactivo">Inactivo</span>';
}
function iconoPromo(tipo) {
    if (tipo === 'PORCENTUAL' || tipo === 'CATEGORIA') return 'bi-ticket-perforated';
    if (tipo === 'GENERAL') return 'bi-percent';
    if (tipo === 'PROMO_2X1' || tipo === 'PROMO_3X2') return 'bi-bag-heart';
    if (tipo === 'REGALO') return 'bi-gift';
    if (tipo === 'COMPRA_MINIMA') return 'bi-cart-check';

    return 'bi-cash-coin';
}
function claseIconoPromo(tipo) {
    if (tipo === 'PORCENTUAL' || tipo === 'CATEGORIA') return 'icon-blue';
    if (tipo === 'GENERAL') return 'icon-red';
    if (tipo === 'PROMO_2X1' || tipo === 'PROMO_3X2') return 'icon-green';
    if (tipo === 'REGALO') return 'icon-orange';
    if (tipo === 'COMPRA_MINIMA') return 'icon-purple';

    return 'icon-red';
}