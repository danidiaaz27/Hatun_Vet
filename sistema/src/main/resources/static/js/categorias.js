$(document).ready(function() {
    const API_BASE = '/categorias/api';

    // Inicializar DataTable
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

    // Nuevo Registro
    $('#btnNuevoRegistro').click(() => {
        $('#formCategoria')[0].reset();
        $('#id').val('');
        $('#modalTitle').text('Nueva Categoría');
        categoriaModal.show();
    });

    // Guardar
    $('#formCategoria').submit(e => {
        e.preventDefault();
        const payload = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val(),
            descripcion: $('#descripcion').val()
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
                Swal.fire('Error', data.message, 'error');
            }
        });
    });

    // Editar
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

    // Cambiar Estado
    $('#tablaCategorias tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    // Eliminar
    $('#tablaCategorias tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar Categoría?',
            text: 'Asegúrate de que no haya productos usando esta categoría.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) dataTable.ajax.reload();
                        else Swal.fire('Error', data.message, 'error');
                    });
            }
        });
    });
});