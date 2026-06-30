function iniciarClientePOS() {
    $('#numDoc').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    $('#tipoDoc').change(configurarTipoDocumento);
    $('#tipoDoc').trigger('change');

    $('#btnBuscarDoc').click(buscarClienteDocumento);
}

function configurarTipoDocumento() {
    const tipo = $('#tipoDoc').val();
    const esDni = tipo === '1';

    $('#numDoc')
        .val('')
        .attr('maxlength', esDni ? '8' : '11')
        .attr('placeholder', esDni ? 'DNI (8 dígitos)' : 'RUC (11 dígitos)');

    $('#nombreCliente').val('');
}

function buscarClienteDocumento() {
    const tipoDoc = $('#tipoDoc').val();
    const numDoc = $('#numDoc').val().trim();

    if (!validarDocumentoVenta(tipoDoc, numDoc)) return;

    const btn = $('#btnBuscarDoc');
    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span>'
    );

    fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
        .then(r => r.json())
        .then(res => manejarRespuestaCliente(res, tipoDoc))
        .catch(() =>
            Swal.fire('Error', 'Fallo al consultar documento.', 'error')
        )
        .finally(() =>
            btn.prop('disabled', false).html('<i class="bi bi-search"></i>')
        );
}

function validarDocumentoVenta(tipoDoc, numDoc) {
    if (tipoDoc === '1' && numDoc.length !== 8) {
        Swal.fire('Atención', 'El DNI debe tener 8 dígitos.', 'warning');
        return false;
    }

    if (tipoDoc === '6' && numDoc.length !== 11) {
        Swal.fire('Atención', 'El RUC debe tener 11 dígitos.', 'warning');
        return false;
    }

    if (tipoDoc === '6') {
        const prefijo = numDoc.substring(0, 2);

        if (!['10', '15', '17', '20'].includes(prefijo)) {
            Swal.fire(
                'RUC Inválido',
                'El RUC debe empezar con 10, 15, 17 o 20.',
                'error'
            );
            return false;
        }
    }

    return true;
}

function manejarRespuestaCliente(res, tipoDoc) {
    const info = res.datos || res.data;

    if (res.success && info) {
        $('#nombreCliente').val(obtenerNombreClienteDocumento(info, tipoDoc));
        return;
    }

    Swal.fire(
        'Información',
        res.message || 'No se encontraron datos.',
        'info'
    );

    $('#nombreCliente').val('');
}

function obtenerNombreClienteDocumento(info, tipoDoc) {
    if (tipoDoc === '1') {
        return (
            info.nombre_completo ||
            `${info.nombres || ''} ${info.ape_paterno || ''} ${info.ape_materno || ''}`
        ).trim();
    }

    return info.nombre_o_razon_social || info.razon_social || info.razonSocial;
}
