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
    const esRuc = tipo === '6';
    const esNotaVenta = tipo === '0';

    // Limpiamos el valor del número para evitar cruce de datos viejos
    $('#numDoc').val('');

    if (esDni) {
        $('#numDoc').attr('maxlength', '8').attr('placeholder', 'DNI (8 dígitos)');
    } else if (esRuc) {
        $('#numDoc').attr('maxlength', '11').attr('placeholder', 'RUC (11 dígitos)');
    } else if (esNotaVenta) {
        $('#numDoc').attr('maxlength', '15').attr('placeholder', 'N° Doc (Nota de Venta)');
    }

    // Al cambiar de tipo de documento, siempre limpiamos el nombre y liberamos el bloqueo de edición
    $('#nombreCliente').val('').prop('readOnly', false);
}

function buscarClienteDocumento() {
    const tipoDoc = $('#tipoDoc').val();
    const numDoc = $('#numDoc').val().trim();

    // Si es Nota de Venta, no es necesario consultar a la API externa de SUNAT/RENIEC
    if (tipoDoc === '0') {
        Swal.fire({
            title: 'Nota de Venta',
            text: 'Para Notas de Venta puede escribir el nombre del cliente directamente en el campo inferior.',
            icon: 'info',
            confirmButtonColor: '#0A3D91'
        });
        return;
    }

    if (!validarDocumentoVenta(tipoDoc, numDoc)) return;

    const btn = $('#btnBuscarDoc');
    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span>'
    );

    fetch(`/ventas/api/consultar-cliente?tipoDoc=${tipoDoc}&numero=${numDoc}`)
        .then(r => {
            if (!r.ok) throw new Error('Respuesta de red no conforme');
            return r.json();
        })
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
    // DECLARACIÓN CRUCIAL: Capturamos el elemento del DOM para poder usarlo abajo
    const inputNombre = $('#nombreCliente');

    const info = res.datos || res.data;

    if (res.success && info) {
        // Colocamos el nombre generado
        inputNombre.val(obtenerNombreClienteDocumento(info, tipoDoc));
        // BLOQUEO: No se puede borrar ni agregar caracteres al nombre generado de RENIEC/SUNAT
        inputNombre.prop('readOnly', true);
        return;
    }

    Swal.fire(
        'Información',
        res.message || 'No se encontraron datos.',
        'info'
    );

    // Si no se encuentra, limpiamos y permitimos escribir manualmente
    inputNombre.val('').prop('readOnly', false);
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
