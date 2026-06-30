function inicializarTablaProductos() {
    dataTable = $('#tablaProductos').DataTable({
        ajax: {
            url: `${API_BASE}/listar`,
            dataSrc: 'data'
        },
        columns: obtenerColumnasProductos(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
    });
}

function obtenerColumnasProductos() {
    return [
        { data: 'imagen', orderable: false, render: renderImagenProducto },
        { data: 'codigo', className: 'fw-bold text-secondary' },
        { data: 'nombre', className: 'fw-bold text-primary', render: renderNombreProducto },
        { data: 'categoria', render: renderCategoriaProducto },
        { data: 'precio', className: 'text-end fw-bold', render: renderPrecioProducto },
        { data: 'stock', className: 'text-center', render: renderStockProducto },
        { data: 'estado', render: renderEstadoProducto },
        { data: null, orderable: false, render: renderAccionesProducto }
    ];
}

function renderImagenProducto(data) {
    if (data) {
        return `<img src="/uploads/${data}" alt="img" class="img-thumbnail"
            style="width:50px;height:50px;object-fit:cover;">`;
    }

    return `<div class="bg-light text-secondary d-flex align-items-center justify-content-center border rounded"
        style="width:50px;height:50px;">
        <i class="bi bi-image fs-4"></i>
    </div>`;
}

function renderNombreProducto(data, type, row) {
    let badge = '';

    if (row.esServicio) {
        badge = ` <span class="badge bg-primary bg-opacity-10 text-primary fw-bold small border"
            style="font-size:10px;"><i class="bi bi-scissors me-1"></i>Servicio</span>`;
    } else if (row.fraccionable) {
        badge = renderBadgeFraccionable(row);
    }

    return data + badge;
}

function renderBadgeFraccionable(row) {
    const stockFracc = row.stockFraccionado || 0;

    return ` <span class="badge bg-info bg-opacity-10 text-info fw-bold small border"
        style="font-size:10px;" title="Envase en uso">
        <i class="bi bi-flask"></i>
        Abierto: ${parseFloat(stockFracc).toFixed(2)} /
        ${parseFloat(row.capacidadTotal).toFixed(2)} ${row.unidadMedida}
    </span>`;
}

function renderCategoriaProducto(data) {
    return data ? data.nombre : '<span class="text-danger">Sin Categoría</span>';
}

function renderPrecioProducto(data) {
    return `S/ ${parseFloat(data).toFixed(2)}`;
}

function renderStockProducto(data, type, row) {
    if (row.esServicio) {
        return '<span class="badge bg-secondary rounded-pill">N/A</span>';
    }

    return data <= 5
        ? `<span class="badge bg-danger rounded-pill">${data}</span>`
        : `<span class="badge bg-success rounded-pill">${data}</span>`;
}

function renderEstadoProducto(data) {
    return data
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
}

function renderAccionesProducto(data, type, row) {
    const iconColor = row.estado ? 'text-warning' : 'text-success';
    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';

    return `
        <div class="btn-group btn-group-sm">
            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar">
                <i class="bi bi-pencil-fill"></i>
            </button>
            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar Estado">
                <i class="bi ${iconClass}"></i>
            </button>
            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>`;
}