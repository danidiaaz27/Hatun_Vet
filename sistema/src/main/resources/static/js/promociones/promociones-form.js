function iniciarFormularioPromociones() {
    $('#tipo').change(actualizarCamposPromocion);
    $('#btnNuevoRegistro').click(abrirModalNuevaPromocion);
    $('#formPromocion').submit(guardarPromocion);
}

function actualizarCamposPromocion() {
    const tipo = $('#tipo').val();

    ocultarCamposPromocion();

    switch (tipo) {
        case 'PORCENTUAL':
            mostrarCamposPorcentual();
            break;

        case 'MONTO_FIJO':
            mostrarCamposMontoFijo();
            break;

        case 'PROMO_2X1':
        case 'PROMO_3X2':
            $('#divProducto').removeClass('d-none');
            $('#productoId').prop('required', true);
            break;

        case 'COMPRA_MINIMA':
            mostrarCamposCompraMinima();
            break;

        case 'REGALO':
            $('#divProducto,#divProductoRegalo').removeClass('d-none');
            $('#productoId,#productoRegaloId').prop('required', true);
            break;

        case 'CATEGORIA':
            mostrarCamposCategoria();
            break;

        case 'GENERAL':
            mostrarCamposGeneral();
            break;
    }
}

function ocultarCamposPromocion() {
    $('#divValor,#divCompraMinima,#divProducto,#divCategoria,#divProductoRegalo')
        .addClass('d-none');

    // CORREGIDO: antes solo se quitaba el "required" pero el valor seleccionado
    // (ej. un producto de una promo 2x1) quedaba guardado en el select oculto.
    // Si luego cambiabas el tipo, ese producto viejo se seguía mandando en el
    // payload sin que se viera en pantalla. Ahora también se limpia el valor.
    // (Esto no rompe la edición: en cargarPromocionEnModal() los valores reales
    // se vuelven a asignar justo después de disparar el 'change' de tipo).
    $('#valor,#compraMinima,#productoId,#categoriaId,#productoRegaloId')
        .prop('required', false)
        .val('');

    $('#valor').removeAttr('max');
}

function mostrarCamposPorcentual() {
    $('#divValor,#divProducto,#divCategoria').removeClass('d-none');
    $('#lblValor').text('Porcentaje de descuento (%) *');
    $('#valor')
        .prop('required', true)
        .attr('placeholder', 'Ej. 15')
        .attr('max', 100);
}

function mostrarCamposMontoFijo() {
    $('#divValor,#divProducto,#divCategoria').removeClass('d-none');
    $('#lblValor').text('Monto de descuento (S/) *');
    $('#valor')
        .prop('required', true)
        .attr('placeholder', 'Ej. 10.00');
}

function mostrarCamposCompraMinima() {
    $('#divCompraMinima,#divValor,#divProductoRegalo')
        .removeClass('d-none');

    $('#compraMinima')
        .prop('required', true)
        .attr('placeholder', 'Ej. 100.00');

    $('#lblValor').text(
        'Descuento por cumplir compra (S/) (Opcional)'
    );
}

function mostrarCamposCategoria() {
    $('#divCategoria,#divValor').removeClass('d-none');

    $('#categoriaId').prop('required', true);

    $('#lblValor').text('Porcentaje de descuento (%) *');

    $('#valor')
        .prop('required', true)
        .attr('placeholder', 'Ej. 20')
        .attr('max', 100);
}

function mostrarCamposGeneral() {
    // Descuento General: solo pide el porcentaje. No requiere producto ni
    // categoría porque se aplica sobre el TOTAL del pedido en el POS, no
    // producto por producto.
    $('#divValor').removeClass('d-none');

    $('#lblValor').text('Porcentaje de descuento general sobre el TOTAL (%) *');

    $('#valor')
        .prop('required', true)
        .attr('placeholder', 'Ej. 10')
        .attr('max', 100);
}

function abrirModalNuevaPromocion() {
    $('#formPromocion')[0].reset();
    $('#id').val('');
    $('#tipo').val('').trigger('change');
    $('#modalTitle').text('Nueva Promoción');

    promocionModal.show();
}

function guardarPromocion(e) {
    e.preventDefault();

    const btn = $('#btnSubmitPromocion');

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm"></span> Guardando...'
    );

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(crearPayloadPromocion())
    })
        .then(r => r.json())
        .then(data => manejarRespuestaGuardarPromocion(data))
        .catch(() => {
            Swal.fire(
                'Error',
                'Fallo al comunicarse con el servidor.',
                'error'
            );
        })
        .finally(() => {
            btn.prop('disabled', false).html('Guardar');
        });
}

function crearPayloadPromocion() {
    return {
        id: $('#id').val() || null,
        nombre: $('#nombre').val().trim(),
        descripcion: $('#descripcion').val().trim(),
        tipo: $('#tipo').val(),
        valor: parseFloat($('#valor').val()) || 0,
        fechaInicio: $('#fechaInicio').val(),
        fechaFin: $('#fechaFin').val(),
        estado: $('#estado').val(),
        compraMinima: parseFloat($('#compraMinima').val()) || 0,
        producto: $('#productoId').val()
            ? { id: $('#productoId').val() }
            : null,
        categoria: $('#categoriaId').val()
            ? { id: $('#categoriaId').val() }
            : null,
        productoRegalo: $('#productoRegaloId').val()
            ? { id: $('#productoRegaloId').val() }
            : null
    };
}

function manejarRespuestaGuardarPromocion(data) {
    if (data.success) {
        promocionModal.hide();
        cargarPromociones();

        Swal.fire('Éxito', data.message, 'success');
        return;
    }

    Swal.fire('Atención', data.message, 'warning');
}