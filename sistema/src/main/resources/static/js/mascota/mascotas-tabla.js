function inicializarTablaMascotas() {
    dt = $('#tablaMascotas').DataTable({
        data: [],
        columns: obtenerColumnasMascotas(),
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        paging: true,
        pageLength: 10,
        searching: false,
        lengthChange: false,
        info: false,
        ordering: false,
        responsive: true,
        autoWidth: false
    });
}

function aplicarFiltroLocal() {
    let data = mascotasCache.slice();

    const especie = normalizarTexto($('#filtroEspecie').val());

    if (especie) {
        data = data.filter(m =>
            normalizarTexto(m.especie).toLowerCase() === especie.toLowerCase()
        );
    }

    dt.clear().rows.add(data).draw();
}

function actualizarEstadisticas() {
    $('#statTotalMascotas').text(mascotasCache.length);

    $('#statConDueño').text(
        mascotasCache.filter(m => m.cliente && m.cliente.id).length
    );
}