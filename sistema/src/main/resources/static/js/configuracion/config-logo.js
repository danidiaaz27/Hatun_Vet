function mostrarLogoConfiguracion(logo) {
    if (logo) {
        $('#logoPreview').attr('src', `/uploads/${logo}`).show();
        $('#logoPlaceholder').hide();
        return;
    }

    $('#logoPreview').hide();
    $('#logoPlaceholder').show();
}

function crearFormDataConfiguracion() {
    const formData = new FormData();

    agregarCamposConfiguracion(formData);

    const logoFile = document.getElementById('logoFile').files[0];

    if (logoFile) {
        if (!validarLogoFile(logoFile)) return null;
        formData.append('logoFile', logoFile);
    }

    return formData;
}

function agregarCamposConfiguracion(formData) {
    formData.append('id', $('#id').val());
    formData.append('nombreVeterinaria', $('#nombreVeterinaria').val().trim());
    formData.append('telefono', $('#telefono').val().trim());
    formData.append('direccion', $('#direccion').val().trim());
    formData.append('correo', $('#correo').val().trim());
    formData.append('facebook', $('#facebook').val().trim());
    formData.append('instagram', $('#instagram').val().trim());
    formData.append('whatsapp', $('#whatsapp').val().trim());
    formData.append('textoHero', $('#textoHero').val().trim());
    formData.append('subtituloHero', $('#subtituloHero').val().trim());
    formData.append('mision', $('#mision').val().trim());
    formData.append('vision', $('#vision').val().trim());
    formData.append(
        'horarioLunesViernes',
        $('#horarioLunesViernes').val().trim()
    );
    formData.append('horarioSabado', $('#horarioSabado').val().trim());
    formData.append('horarioDomingo', $('#horarioDomingo').val().trim());
}

function validarLogoFile(logoFile) {
    if (logoFile.size > 2 * 1024 * 1024) {
        Swal.fire('Error', 'El logo no debe superar los 2MB', 'error');
        return false;
    }

    return true;
}