function iniciarFormularioConfiguracion() {
    $('#btnGuardarConfiguracion').click(guardarConfiguracion);
}

function cargarConfiguracion() {
    fetch(`${API_BASE}/datos`)
        .then(r => r.json())
        .then(res => {
            if (!res.success) return;

            const config = res.data || {};
            cargarCamposConfiguracion(config);
            mostrarLogoConfiguracion(config.logo);
        });
}

function cargarCamposConfiguracion(config) {
    $('#id').val(config.id || '');
    $('#nombreVeterinaria').val(config.nombreVeterinaria || '');
    $('#telefono').val(config.telefono || '');
    $('#direccion').val(config.direccion || '');
    $('#correo').val(config.correo || '');
    $('#facebook').val(config.facebook || '');
    $('#instagram').val(config.instagram || '');
    $('#whatsapp').val(config.whatsapp || '');
    $('#textoHero').val(config.textoHero || '');
    $('#subtituloHero').val(config.subtituloHero || '');
    $('#mision').val(config.mision || '');
    $('#vision').val(config.vision || '');
    $('#horarioLunesViernes').val(
        config.horarioLunesViernes || '8:00 AM - 8:00 PM'
    );
    $('#horarioSabado').val(config.horarioSabado || '9:00 AM - 6:00 PM');
    $('#horarioDomingo').val(config.horarioDomingo || 'Cerrado');
}

function guardarConfiguracion() {
    const btn = $('#btnGuardarConfiguracion');

    btn.prop('disabled', true).html(
        '<span class="spinner-border spinner-border-sm me-2"></span> Guardando...'
    );

    const formData = crearFormDataConfiguracion();

    if (!formData) {
        btn.prop('disabled', false).html(
            '<i class="bi bi-floppy me-1"></i> Guardar Cambios'
        );
        return;
    }

    fetch(`${API_BASE}/datos`, {
        method: 'POST',
        body: formData
    })
        .then(r => r.json())
        .then(data => {
            Swal.fire(
                data.success ? 'Éxito' : 'Error',
                data.message,
                data.success ? 'success' : 'error'
            );

            if (data.success) cargarConfiguracion();
        })
        .finally(() => {
            btn.prop('disabled', false).html(
                '<i class="bi bi-floppy me-1"></i> Guardar Cambios'
            );
        });
}