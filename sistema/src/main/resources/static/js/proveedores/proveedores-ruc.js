function iniciarBusquedaRuc() {
    $('#btnBuscarRuc').click(buscarRucProveedor);
}

function buscarRucProveedor() {
    const ruc = $('#ruc').val().trim();

    if (!validarRucProveedor(ruc)) return;

    const btn = $('#btnBuscarRuc');
    const icon = btn.html();

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span>'
    );

    fetch(`/ventas/api/consultar-cliente?tipoDoc=6&numero=${ruc}`)
        .then(r => r.json())
        .then(res => cargarDatosRucProveedor(res))
        .catch(() =>
            Swal.fire('Error', 'No se pudo consultar el RUC.', 'error')
        )
        .finally(() =>
            btn.prop('disabled', false).html(icon)
        );
}

function cargarDatosRucProveedor(res) {
    const info = res.datos || res.data;

    if (res.success && info) {
        const razonSocial =
            info.nombre_o_razon_social ||
            info.razon_social ||
            info.nombre_completo;

        const direccion =
            info.direccion ||
            info.domicilio_fiscal ||
            info.direccion_completa;

        if (razonSocial) $('#nombre').val(razonSocial);
        if (direccion) $('#direccion').val(direccion);

        Swal.fire('Listo', 'Datos del RUC cargados desde SUNAT.', 'success');
        return;
    }

    Swal.fire(
        'No encontrado',
        'No se encontraron datos para ese RUC en la base de SUNAT.',
        'info'
    );
}