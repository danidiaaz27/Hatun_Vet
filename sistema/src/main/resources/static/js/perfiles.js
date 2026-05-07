$(document).ready(function() {
    const API_BASE = '/perfiles/api';
    let dataTable = $('#tablaPerfiles').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold text-primary' },
            { data: 'descripcion' },
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
                            <button data-id="${row.id}" class="btn btn-light border action-permissions text-dark" title="Permisos"><i class="bi bi-shield-lock-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar Estado"><i class="bi ${iconClass}"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>`;
                }
            }
        ],
        language: { url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });

    const perfilModal = new bootstrap.Modal(document.getElementById('perfilModal'));
    const permisosModal = new bootstrap.Modal(document.getElementById('permisosModal'));

    $('#btnNuevoRegistro').click(() => {
        $('#formPerfil')[0].reset();
        $('#id').val('');
        $('#modalTitle').text('Nuevo Perfil');
        perfilModal.show();
    });

    $('#formPerfil').submit(e => {
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
                perfilModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        });
    });

    // Editar
    $('#tablaPerfiles tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    $('#id').val(res.data.id);
                    $('#nombre').val(res.data.nombre);
                    $('#descripcion').val(res.data.descripcion);
                    $('#modalTitle').text('Editar Perfil');
                    perfilModal.show();
                }
            });
    });

    // Cambiar Estado
    $('#tablaPerfiles tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    // Modal Permisos
    $('#tablaPerfiles tbody').on('click', '.action-permissions', async function() {
        const id = $(this).data('id');
        $('#permisoPerfilId').val(id);

        const [perfilRes, opcionesRes] = await Promise.all([
            fetch(`${API_BASE}/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/opciones`).then(r => r.json())
        ]);

        $('#permisoPerfilNombre').text(perfilRes.data.nombre);
        const lista = $('#listaOpciones').empty();

        opcionesRes.data.forEach(op => {
            const isChecked = perfilRes.data.opciones.includes(op.id) ? 'checked' : '';
            lista.append(`
                <label class="list-group-item d-flex align-items-center">
                    <input class="form-check-input me-3" type="checkbox" value="${op.id}" ${isChecked}>
                    <i class="${op.icono} me-2 text-muted"></i> ${op.nombre}
                </label>
            `);
        });
        permisosModal.show();
    });

    // Guardar Permisos
    $('#btnGuardarPermisos').click(async () => {
        const perfilId = $('#permisoPerfilId').val();
        const opcionesSeleccionadas = $('#listaOpciones input:checked').map(function() {
            return { id: $(this).val() };
        }).get();

        const perfilRes = await fetch(`${API_BASE}/${perfilId}`).then(r => r.json());
        const perfilToUpdate = { ...perfilRes.data, opciones: opcionesSeleccionadas };

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfilToUpdate)
        }).then(() => {
            permisosModal.hide();
            Swal.fire('Permisos Actualizados', '', 'success');
        });
    });

    // Eliminar
    $('#tablaPerfiles tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar perfil?',
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