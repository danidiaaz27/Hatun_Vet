$(document).ready(function() {
    const API_BASE = '/categorias/api';

    let dataTable = $('#tablaCategorias').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold text-primary' },
            { data: 'descripcion', render: data => data || '<span class="text-muted fst-italic">Sin descripción</span>' },
            {
                data: 'estado',
                render: data => data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                render: function(data, type, row) {
                    const iconColor = row.estado ? 'text-warning' : 'text-success';
                    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';
                    return `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar Estado"><i class="bi ${iconClass}"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const categoriaModal = new bootstrap.Modal(document.getElementById('categoriaModal'));

    $('#btnNuevoRegistro').click(() => {
        $('#formCategoria')[0].reset();
        $('#id').val('');
        $('#modalTitle').text('Nueva Categoría');
        categoriaModal.show();
    });

    $('#formCategoria').submit(e => {
        e.preventDefault();

        // VALIDACIÓN 3: Bloqueo de botón para evitar múltiples envíos
        const btnGuardar = $('#btnSubmitCategoria');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        const payload = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val().trim(), // Limpieza de espacios
            descripcion: $('#descripcion').val().trim()
        };

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json()).then(data => {
            if (data.success) {
                categoriaModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Atención', data.message, 'warning');
            }
        }).catch(() => {
            Swal.fire('Error', 'Fallo al comunicarse con el servidor.', 'error');
        }).finally(() => {
            btnGuardar.prop('disabled', false).html('Guardar');
        });
    });

    $('#tablaCategorias tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    $('#id').val(res.data.id);
                    $('#nombre').val(res.data.nombre);
                    $('#descripcion').val(res.data.descripcion);
                    $('#modalTitle').text('Editar Categoría');
                    categoriaModal.show();
                }
            });
    });

    $('#tablaCategorias tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    $('#tablaCategorias tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar Categoría?',
            text: 'Se verificará que no haya productos asociados a ella.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminada', data.message, 'success');
                        } else {
                            Swal.fire('No se puede eliminar', data.message, 'error');
                        }
                    });
            }
        });
    });
});