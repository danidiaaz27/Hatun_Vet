$(document).ready(function() {
    const API_BASE = '/proveedores/api';
    const proveedorModal = new bootstrap.Modal(document.getElementById('proveedorModal'));

    const dataTable = $('#tablaProveedores').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            { data: 'nombre', className: 'fw-bold text-primary' },
            { data: 'ruc' },
            {
                data: null,
                render: row => {
                    let html = '';
                    if (row.contacto) html += `<div class="small"><i class="bi bi-person-badge me-1"></i>${row.contacto}</div>`;
                    if (row.telefono) html += `<div class="small"><i class="bi bi-telephone me-1"></i>${row.telefono}</div>`;
                    if (row.correo) html += `<div class="small"><i class="bi bi-envelope me-1"></i>${row.correo}</div>`;
                    return html || '<span class="text-muted fst-italic">Sin datos</span>';
                }
            },
            {
                data: 'direccion',
                render: data => data || '<span class="text-muted fst-italic">Sin dirección</span>'
            },
            {
                data: 'estado',
                className: 'text-center',
                render: estado => estado
                    ? '<span class="badge bg-success">Activo</span>'
                    : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                orderable: false,
                className: 'text-center',
                render: row => {
                    const iconColor = row.estado ? 'text-warning' : 'text-success';
                    const iconClass = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';
                    return `
                        <div class="btn-group btn-group-sm">
                            <button data-id="${row.id}" class="btn btn-light border action-edit text-primary" title="Editar"><i class="bi bi-pencil-fill"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-status ${iconColor}" title="Cambiar estado"><i class="bi ${iconClass}"></i></button>
                            <button data-id="${row.id}" class="btn btn-light border action-delete text-danger" title="Eliminar"><i class="bi bi-trash-fill"></i></button>
                        </div>`;
                }
            }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' }
    });

    $('#btnNuevoProveedor').click(() => {
        $('#formProveedor')[0].reset();
        $('#id').val('');
        $('#estado').val('true');
        $('#modalTitle').text('Nuevo Proveedor');
        proveedorModal.show();
    });

    $('#ruc').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
    });

    $('#btnBuscarRuc').click(function() {
        const ruc = $('#ruc').val().trim();
        if (ruc.length !== 11) {
            Swal.fire('Validación', 'Ingresa un RUC válido de 11 dígitos.', 'warning');
            return;
        }

        const btn = $(this);
        const icon = btn.html();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

        fetch(`/ventas/api/consultar-cliente?tipoDoc=6&numero=${ruc}`)
            .then(r => r.json())
            .then(res => {
                const info = res.datos || res.data;
                if (res.success && info) {
                    const razonSocial = info.nombre_o_razon_social || info.razon_social || info.nombre_completo;
                    const direccion = info.direccion || info.domicilio_fiscal || info.direccion_completa;

                    if (razonSocial) {
                        $('#nombre').val(razonSocial);
                    }
                    if (direccion) {
                        $('#direccion').val(direccion);
                    }

                    Swal.fire('Listo', 'Datos del RUC cargados.', 'success');
                } else {
                    Swal.fire('No encontrado', 'No se encontraron datos para ese RUC.', 'info');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo consultar el RUC.', 'error'))
            .finally(() => btn.prop('disabled', false).html(icon));
    });

    $('#telefono').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 15);
    });

    $('#formProveedor').submit(function(e) {
        e.preventDefault();

        const ruc = $('#ruc').val().trim();
        if (ruc.length !== 11) {
            Swal.fire('Validación', 'El RUC debe tener 11 dígitos.', 'warning');
            return;
        }

        const payload = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val().trim(),
            ruc,
            telefono: $('#telefono').val().trim(),
            correo: $('#correo').val().trim(),
            direccion: $('#direccion').val().trim(),
            contacto: $('#contacto').val().trim(),
            estado: $('#estado').val() === 'true'
        };

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => r.json())
            .then(res => {
                console.log('Respuesta del servidor:', res);
                if (res.success) {
                    proveedorModal.hide();
                    dataTable.ajax.reload();
                    Swal.fire('Éxito', res.message, 'success');
                } else {
                    Swal.fire('Atención', res.message || 'Error desconocido', 'warning');
                }
            })
            .catch(err => {
                console.error('Error de conexión:', err);
                Swal.fire('Error', 'No se pudo guardar el proveedor: ' + err.message, 'error');
            });
    });

    $('#tablaProveedores tbody').on('click', '.action-edit', function() {
        const id = $(this).data('id');
        fetch(`${API_BASE}/${id}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    $('#id').val(res.data.id);
                    $('#nombre').val(res.data.nombre);
                    $('#ruc').val(res.data.ruc);
                    $('#telefono').val(res.data.telefono || '');
                    $('#correo').val(res.data.correo || '');
                    $('#direccion').val(res.data.direccion || '');
                    $('#contacto').val(res.data.contacto || '');
                    $('#estado').val(String(res.data.estado));
                    $('#modalTitle').text('Editar Proveedor');
                    proveedorModal.show();
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo cargar el proveedor.', 'error'));
    });

    $('#tablaProveedores tbody').on('click', '.action-status', function() {
        const id = $(this).data('id');
        fetch(`${API_BASE}/cambiar-estado/${id}`, { method: 'POST' })
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    dataTable.ajax.reload();
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            })
            .catch(() => Swal.fire('Error', 'No se pudo cambiar el estado.', 'error'));
    });

    $('#tablaProveedores tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');

        Swal.fire({
            title: '¿Eliminar proveedor?',
            text: 'Esta acción no se puede revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#D32F2F',
            cancelButtonText: 'Cancelar'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => {
                        if (res.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminado', res.message, 'success');
                        } else {
                            Swal.fire('Error', res.message, 'error');
                        }
                    })
                    .catch(() => Swal.fire('Error', 'No se pudo eliminar el proveedor.', 'error'));
            }
        });
    });
});
