let serviciosCatalogo = [];

function iniciarCatalogoServicios() {
    $('#tipoServicioSelect').change(function () {
        const option = $(this).find('option:selected');
        const price = parseFloat(option.data('precio')) || 0;

        $('#precio').val(price > 0 ? price.toFixed(2) : '');
    });
}

function cargarTiposServicio() {
    fetch('/productos/api/servicios-activos')
        .then(r => r.json())
        .then(res => {
            const select = $('#tipoServicioSelect');

            select.empty();
            select.append('<option value="">-- Seleccione un Servicio --</option>');

            serviciosCatalogo = res.data || [];

            serviciosCatalogo.forEach(s => {
                select.append(`
                    <option value="${s.id}" data-precio="${s.precio}">
                        ${s.nombre} (S/ ${parseFloat(s.precio).toFixed(2)})
                    </option>
                `);
            });
        });
}