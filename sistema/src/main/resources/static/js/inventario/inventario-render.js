function renderCodigo(data) {
    return `<span class="codigo-badge">${data}</span>`;
}
function renderProducto(row) {
    const img = row.imagen
        ? `
            <img
                src="/uploads/${row.imagen}"
                style="width:32px;height:32px;
                object-fit:contain;
                border-radius:6px;
                margin-right:10px;">
        `
        : `
            <span
                style="
                    width:32px;
                    height:32px;
                    background:#f0f4fa;
                    border-radius:6px;
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    margin-right:10px;">
                <i class="bi bi-box-seam"
                    style="color:#c8d3e8;"></i>
            </span>
        `;

    const descripcion = row.descripcion
        ? `
            <div style="font-size:11px;color:#8a9bc0;">
                ${row.descripcion.substring(0,40)}
                ${row.descripcion.length > 40 ? '...' : ''}
            </div>
        `
        : '';
    return `
        <div class="d-flex align-items-center">
            ${img}

            <div>
                <div class="fw-bold" style="font-size:13.5px;">
                    ${row.nombre}
                </div>

                ${descripcion}
            </div>
        </div>
    `;
}
function renderCategoria(data) {
    if (data && data.nombre) {
        return `<span class="cat-pill">${data.nombre}</span>`;
    }

    return '<span class="text-muted small">—</span>';
}

function renderStock(stock) {
    const cls =
        stock <= 0
            ? 'stock-agotado'
            : stock <= 5
                ? 'stock-bajo'
                : 'stock-ok';

    return `
        <span class="stock-badge ${cls}">
            ${stock} uds.
        </span>
    `;
}

function renderEstado(stock) {

    if (stock <= 0) {
        return `
            <span class="estado-pill estado-agotado">
                <span
                    style="
                        width:6px;
                        height:6px;
                        border-radius:50%;
                        background:#b71c1c;
                        display:inline-block;">
                </span>

                Agotado
            </span>
        `;
    }

    if (stock <= 5) {
        return `
            <span class="estado-pill estado-bajo">
                <span
                    style="
                        width:6px;
                        height:6px;
                        border-radius:50%;
                        background:#b45309;
                        display:inline-block;">
                </span>

                Stock Bajo
            </span>
        `;
    }

    return `
        <span class="estado-pill estado-ok">
            <span
                style="
                    width:6px;
                    height:6px;
                    border-radius:50%;
                    background:#1a6e40;
                    display:inline-block;">
            </span>

            En Stock
        </span>
    `;
}

function renderBotones(row) {

    return `
        <div class="d-flex align-items-center justify-content-center gap-2">

            <button
                class="btn-inv btn-inv-plus"
                onclick="abrirModalIngreso(
                    '${row.id}',
                    '${row.nombre.replace(/'/g, "\\'")}'
                )"
                title="Registrar Ingreso">
                +
            </button>

            <button
                class="btn-inv btn-inv-minus"
                onclick="abrirModalSalida(
                    '${row.id}',
                    '${row.nombre.replace(/'/g, "\\'")}',
                    ${row.stock}
                )"
                title="Registrar Salida">
                −
            </button>

        </div>
    `;
}

function renderLog(id) {
    return `
        <button
            class="btn-ver-log"
            onclick="abrirModalKardex('${id}')">

            <i class="bi bi-clock-history me-1"></i>

            Ver Log

        </button>
    `;
}