function mostrarInfoInsumoSeleccionado(producto) {
    const infoDiv = document.getElementById('infoStockInsumo');

    infoDiv.style.display = 'block';

    document.getElementById('lblNombreInsumoInfo').innerText = producto.nombre;
    document.getElementById('lblStockGeneralInfo').innerText = producto.stock;

    if (producto.fraccionable) {
        mostrarInfoProductoFraccionable(producto);
        return;
    }

    mostrarInfoProductoUnidad(producto);
}

function ocultarInfoInsumo() {
    document.getElementById('infoStockInsumo').style.display = 'none';
}

function mostrarInfoProductoFraccionable(producto) {
    document.getElementById('lblEnvaseAbiertoContainer').style.display = 'inline';
    document.getElementById('lblStockFraccionadoInfo').innerText =
        `${parseFloat(producto.stockFraccionado || 0).toFixed(2)} ${producto.unidadMedida}`;
    document.getElementById('lblPrecioInsumoInfo').innerText =
        `S/ ${parseFloat(producto.precioFraccionado).toFixed(2)} por ${producto.unidadMedida}`;
    document.getElementById('lblUnidadInsumo').innerText = producto.unidadMedida;
}

function mostrarInfoProductoUnidad(producto) {
    document.getElementById('lblEnvaseAbiertoContainer').style.display = 'none';
    document.getElementById('lblPrecioInsumoInfo').innerText =
        `S/ ${parseFloat(producto.precio).toFixed(2)} por unidad`;
    document.getElementById('lblUnidadInsumo').innerText = 'unidad(es)';
}

function renderInsumosConsumidos(insumos) {
    const tbody = document.querySelector('#tablaInsumosAgregados tbody');

    tbody.innerHTML = '';

    if (!insumos || insumos.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4" class="text-center text-muted py-3">No hay insumos registrados para esta consulta.</td></tr>';
        return;
    }

    let total = 0;

    insumos.forEach(ins => {
        total += ins.precioCobrado;
        tbody.innerHTML += crearFilaInsumo(ins);
    });

    tbody.innerHTML += crearFilaTotalInsumos(total);

    conectarBotonesRevertirInsumo();
}

function crearFilaInsumo(ins) {
    return `
        <tr class="border-bottom">
            <td class="ps-3 fw-bold text-dark">${ins.productoNombre}</td>
            <td class="text-center">
                ${parseFloat(ins.cantidadUsada).toFixed(2)} ${ins.unidadMedida}
            </td>
            <td class="text-end">
                S/ ${parseFloat(ins.precioCobrado).toFixed(2)}
            </td>
            <td class="text-end pe-3">
                <button type="button"
                    class="btn btn-sm btn-outline-danger btn-revertir-insumo"
                    data-id="${ins.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

function crearFilaTotalInsumos(total) {
    return `
        <tr class="table-light fw-bold">
            <td colspan="2" class="ps-3 text-secondary text-uppercase small">
                Subtotal Insumos
            </td>
            <td class="text-end text-primary">S/ ${total.toFixed(2)}</td>
            <td></td>
        </tr>
    `;
}