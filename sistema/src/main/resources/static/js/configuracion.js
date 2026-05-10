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
                $('#logoActual').val(config.logo || '');
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
                    tbody.append('<tr><td colspan="4" class="text-center text-muted py-4">No hay imágenes registradas</td></tr>');
                    return;
                }

                res.data.forEach(imagen => {
                    const badge = imagen.estado ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
                    const preview = imagen.imagen
                        ? `<img src="/uploads/${imagen.imagen}" alt="${imagen.tipo || 'Imagen'}" class="rounded border" style="width: 56px; height: 56px; object-fit: cover;">`
                        : '<div class="bg-light border rounded d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;"><i class="bi bi-image text-muted"></i></div>';

                    tbody.append(`
                        <tr>
                            <td>${preview}</td>
                            <td class="fw-semibold">${imagen.tipo || 'Sin tipo'}</td>
                            <td>${badge}</td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-light border text-primary action-edit-img" data-id="${imagen.id}" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                                    <button class="btn btn-light border ${imagen.estado ? 'text-warning' : 'text-success'} action-toggle-img" data-id="${imagen.id}" title="Cambiar estado"><i class="bi ${imagen.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i></button>
                                    <button class="btn btn-light border text-danger action-delete-img" data-id="${imagen.id}" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                                </div>
                            </td>
                        </tr>
                    `);
                });
            });
    }

    $('#btnGuardarConfiguracion').click(() => {
        const formData = new FormData();

        if ($('#id').val()) formData.append('id', $('#id').val());
        formData.append('nombreVeterinaria', $('#nombreVeterinaria').val());
        formData.append('telefono', $('#telefono').val());
        formData.append('direccion', $('#direccion').val());
        formData.append('correo', $('#correo').val());
        formData.append('facebook', $('#facebook').val());
        formData.append('instagram', $('#instagram').val());
        formData.append('whatsapp', $('#whatsapp').val());
        formData.append('textoHero', $('#textoHero').val());
        formData.append('subtituloHero', $('#subtituloHero').val());
        formData.append('mision', $('#mision').val());
        formData.append('vision', $('#vision').val());

        const logoFile = document.getElementById('logoFile');
        if (logoFile.files.length > 0) {
            formData.append('logoFile', logoFile.files[0]);
        }

        fetch(`${API_BASE}/datos`, {
            method: 'POST',
            body: formData
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Éxito', data.message, 'success');
                    $('#logoFile').val('');
                    cargarConfiguracion();
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            });
    });

    $('#btnNuevaImagen').click(() => {
        $('#formLandingImagen')[0].reset();
        $('#landingId').val('');
        $('#landingModalTitle').text('Nueva Imagen');
        landingModal.show();
    });

    $('#formLandingImagen').submit(e => {
        e.preventDefault();

        const formData = new FormData();
        if ($('#landingId').val()) formData.append('id', $('#landingId').val());
        formData.append('tipo', $('#tipo').val());
        formData.append('estado', $('#estado').val());

        const fileInput = document.getElementById('imagenFile');
        if (fileInput.files.length > 0) {
            formData.append('imagenFile', fileInput.files[0]);
        }

        fetch(`${API_BASE}/imagenes/guardar`, {
            method: 'POST',
            body: formData
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    landingModal.hide();
                    cargarImagenes();
                    Swal.fire('Éxito', data.message, 'success');
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            });
    });

    $('#landingImagesBody').on('click', '.action-edit-img', function() {
        fetch(`${API_BASE}/imagenes/${$(this).data('id')}`)
            .then(r => r.json())
            .then(res => {
                if (!res.success) return;
                const imagen = res.data;
                $('#landingId').val(imagen.id);
                $('#tipo').val(imagen.tipo || '');
                $('#estado').val(imagen.estado ? 'true' : 'false');
                $('#imagenFile').val('');
                $('#landingModalTitle').text('Editar Imagen');
                landingModal.show();
            });
    });

    $('#landingImagesBody').on('click', '.action-toggle-img', function() {
        fetch(`${API_BASE}/imagenes/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => cargarImagenes());
    });

    $('#landingImagesBody').on('click', '.action-delete-img', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar imagen?',
            text: 'Se borrará la imagen registrada del landing.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/imagenes/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            cargarImagenes();
                            Swal.fire('Eliminado', data.message, 'success');
                        } else {
                            Swal.fire('Error', data.message, 'error');
                        }
                    });
            }
        });
    });

    cargarConfiguracion();
    cargarImagenes();
});