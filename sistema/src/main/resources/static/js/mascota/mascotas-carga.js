function cargarMascotas(
    endpoint = `${API_URL}/listar`,
    etiquetaFiltro = 'Listado general'
) {
    $('#lblFiltroActivo').text(etiquetaFiltro);

    $('#tablaMascotas tbody').html(`
        <tr>
            <td colspan="7" class="text-center py-5">
                <span class="spinner-border text-primary"></span>
            </td>
        </tr>
    `);

    fetch(endpoint)
        .then(r => r.json())
        .then(res => {
            mascotasCache = res.data || [];

            renderEspeciesFiltro();
            aplicarFiltroLocal();
            actualizarEstadisticas();
        })
        .catch(() => {
            mascotasCache = [];
            dt.clear().draw();

            $('#tablaMascotas tbody').html(`
                <tr>
                    <td colspan="7" class="text-center text-danger py-4">
                        No se pudo cargar la información
                    </td>
                </tr>
            `);
        });
}

function cargarClientesSeleccion() {
    return fetch(`${CLIENTES_API_URL}/listar`)
        .then(r => r.json())
        .then(res => {
            clientesCache = res.data || [];
            renderClientesSelect();
        })
        .catch(() => {
            clientesCache = [];
            renderClientesSelect();
        });
}