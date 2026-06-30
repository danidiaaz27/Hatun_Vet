function iniciarEventosProducto() {
    $('#fraccionable').change(alternarFraccionable);
    $('#esServicio').change(alternarServicio);
}

function alternarFraccionable() {
    if (this.checked) {
        $('#seccionFraccionamiento').slideDown(200);
        $('#unidadMedida').prop('required', true);
        $('#capacidadTotal').prop('required', true);
        $('#precioFraccionado').prop('required', true);
        return;
    }

    $('#seccionFraccionamiento').slideUp(200);
    $('#unidadMedida').prop('required', false).val('');
    $('#capacidadTotal').prop('required', false).val('');
    $('#precioFraccionado').prop('required', false).val('');
}

function alternarServicio() {
    if (this.checked) {
        $('#grupoStock').hide();
        $('#stock').prop('required', false).val(0);
        $('#grupoFraccionable').hide();
        $('#fraccionable').prop('checked', false).trigger('change');
        return;
    }

    $('#grupoStock').show();
    $('#stock').prop('required', true);
    $('#grupoFraccionable').show();
}

function validarImagenProducto() {
    const fileInput = document.getElementById('imagenFile');

    if (fileInput.files.length === 0) return true;

    const fileSize = fileInput.files[0].size / 1024 / 1024;

    if (fileSize > 2) {
        Swal.fire(
            'Archivo muy pesado',
            'La imagen no puede pesar más de 2MB.',
            'warning'
        );
        return false;
    }

    return true;
}