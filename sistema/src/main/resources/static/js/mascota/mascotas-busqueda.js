function iniciarBusquedaMascotas() {
    $('#btnBuscar').on('click', ejecutarBusqueda);

    $('#btnLimpiar').on('click', limpiarBusqueda);

    $('#filtroEspecie').on('change', aplicarFiltroLocal);

    $('#btnRefrescarClientes').on('click', () => {
        cargarClientesSeleccion().then(() => {
            Swal.fire(
                'Actualizado',
                'Lista de dueños actualizada.',
                'success'
            );
        });
    });
}

function ejecutarBusqueda() {
    const texto = normalizarTexto($('#txtBuscar').val());

    filtroActual = texto;

    if (!texto) {
        cargarMascotas(`${API_URL}/listar`, 'Listado general');
        return;
    }

    const endpoint =
        `${API_URL}/buscar?texto=${encodeURIComponent(texto)}`;

    cargarMascotas(endpoint, `Búsqueda: "${texto}"`);
}

function limpiarBusqueda() {
    $('#txtBuscar').val('');
    $('#filtroEspecie').val('');

    filtroActual = '';

    cargarMascotas(
        `${API_URL}/listar`,
        'Listado general'
    );
}