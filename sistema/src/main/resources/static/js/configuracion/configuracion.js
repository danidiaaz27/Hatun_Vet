$(document).ready(function() {
    const API_BASE = '/configuracion/api';
    const landingModal = new bootstrap.Modal(document.getElementById('landingImagenModal'));

    function cargarConfiguracion() {
        fetch(`${API_BASE}/datos`)
            .then(r => r.json())
            .then(res => {
                if (!res.success) return;
                const config = res.data || {};
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
                $('#horarioLunesViernes').val(config.horarioLunesViernes || '8:00 AM - 8:00 PM');
                $('#horarioSabado').val(config.horarioSabado || '9:00 AM - 6:00 PM');
                $('#horarioDomingo').val(config.horarioDomingo || 'Cerrado');

                if (config.logo) {
                    $('#logoPreview').attr('src', `/uploads/${config.logo}`).show();
                    $('#logoPlaceholder').hide();
                } else {
                    $('#logoPreview').hide();
                    $('#logoPlaceholder').show();
                }
            });
    }

    function cargarImagenes() {
        fetch(`${API_BASE}/imagenes`)
            .then(r => r.json())
            .then(res => {
                const tbody = $('#landingImagesBody');
                tbody.empty();
                if (!res.success || !res.data || res.data.length === 0) {
                    tbody.append('<tr><td colspan="4" class="text-center text-muted py-4">No hay imágenes</td></tr>');
                    return;
                }
                res.data.forEach(img => {
                    tbody.append(`
                        <tr>
                            <td><img src="/uploads/${img.imagen}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;"></td>
                            <td style="font-size:13px;">${img.tipo}</td>
                            <td>
                                ${img.estado
                                    ? '<span style="background:#e8f5ee;color:#1a6e40;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;">Activo</span>'
                                    : '<span style="background:#f0f4fa;color:#8a9bc0;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;">Inactivo</span>'}
                            </td>
                            <td>
                                <div class="action-group">
                                    <button class="btn-action btn-action-edit action-edit-img" data-id="${img.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                                    <button class="btn-action btn-action-delete action-delete-img" data-id="${img.id}" title="Eliminar"><i class="bi bi-trash"></i></button>
                                </div>
                            </td>
                        </tr>`);
                });
            });
    }

    $('#btnGuardarConfiguracion').click(function() {
        const btn = $(this);
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span> Guardando...');

        const formData = new FormData();
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
        formData.append('horarioLunesViernes', $('#horarioLunesViernes').val().trim());
        formData.append('horarioSabado', $('#horarioSabado').val().trim());
        formData.append('horarioDomingo', $('#horarioDomingo').val().trim());

        const logoFile = document.getElementById('logoFile').files[0];
        if (logoFile) {
            if (logoFile.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'El logo no debe superar los 2MB', 'error');
                btn.prop('disabled', false).html('<i class="bi bi-floppy me-1"></i> Guardar Cambios');
                return;
            }
            formData.append('logoFile', logoFile);
        }

        fetch(`${API_BASE}/datos`, { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                Swal.fire(data.success ? 'Éxito' : 'Error', data.message, data.success ? 'success' : 'error');
                if (data.success) cargarConfiguracion();
            })
            .finally(() => btn.prop('disabled', false).html('<i class="bi bi-floppy me-1"></i> Guardar Cambios'));
    });

    $('#formLandingImagen').submit(e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', $('#landingId').val());
        formData.append('tipo', $('#tipo').val().trim());
        formData.append('estado', $('#estado').val());
        const file = document.getElementById('imagenFile').files[0];
        if (file) formData.append('imagenFile', file);

        fetch(`${API_BASE}/imagenes/guardar`, { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.success) { landingModal.hide(); cargarImagenes(); Swal.fire('Éxito', data.message, 'success'); }
                else Swal.fire('Error', data.message, 'error');
            });
    });

    $('#landingImagesBody').on('click', '.action-edit-img', function() {
        fetch(`${API_BASE}/imagenes/${$(this).data('id')}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    $('#landingId').val(res.data.id);
                    $('#tipo').val(res.data.tipo);
                    $('#estado').val(res.data.estado ? 'true' : 'false');
                    landingModal.show();
                }
            });
    });

    $('#landingImagesBody').on('click', '.action-delete-img', function() {
        const id = $(this).data('id');
        Swal.fire({ title: '¿Eliminar imagen?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#D32F2F', cancelButtonColor: '#6b7a99', confirmButtonText: 'Sí, eliminar' })
            .then(res => {
                if (res.isConfirmed) {
                    fetch(`${API_BASE}/imagenes/eliminar/${id}`, { method: 'DELETE' })
                        .then(() => cargarImagenes());
                }
            });
    });

    $('#btnNuevaImagen').click(() => { $('#formLandingImagen')[0].reset(); $('#landingId').val(''); landingModal.show(); });

    cargarConfiguracion();
    cargarImagenes();
});