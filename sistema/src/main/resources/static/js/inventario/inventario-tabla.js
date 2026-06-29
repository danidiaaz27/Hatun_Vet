function inicializarTablaInventario() {
    dataTable = $('#tablaInventario').DataTable({
        ajax: {
            url: `${API_URL}/productos`,
            dataSrc: procesarDatosInventario
        },
        columns: obtenerColumnasInventario(),
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        order: [[0, 'asc']]
    });
}

function procesarDatosInventario(json) {
    const data = json.data || [];

    actualizarEstadisticasInventario(data);

    return data;
}

function actualizarEstadisticasInventario(data) {
    const total = data.length;
    const agotado = data.filter(p => p.stock <= 0).length;
    const bajo = data.filter(p => p.stock > 0 && p.stock <= 5).length;
    const ok = data.filter(p => p.stock > 5).length;

    $('#statTotal').text(total);
    $('#statAgotado').text(agotado);
    $('#statBajo').text(bajo);
    $('#statOk').text(ok);
}

function obtenerColumnasInventario() {
    return [
        {
            data: 'codigo',
            render: renderCodigo
        },
        {
            data: null,
            render: renderProducto
        },
        {
            data: 'categoria',
            render: renderCategoria
        },
        {
            data: 'stock',
            className: 'text-center',
            render: renderStock
        },
        {
            data: 'stock',
            className: 'text-center',
            render: renderEstado
        },
        {
            data: null,
            className: 'text-center',
            render: renderBotones
        },
        {
            data: 'id',
            className: 'text-center',
            render: renderLog
        }
    ];
}