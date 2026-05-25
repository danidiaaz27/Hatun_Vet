$(document).ready(function() {
    const API_BASE = '/productos/api';

    function cargarCategorias() {
        fetch(`${API_BASE}/categorias`)
            .then(r => r.json())
            .then(res => {
                if(res.success) {
                    const select = $('#id_categoria');
                    select.find('option:not(:first)').remove();
                    res.data.filter(c => c.estado).forEach(c => {
                        select.append(`<option value="${c.id}">${c.nombre}</option>`);
                    });
                }
            });
    }

    function cargarProveedores() {
        fetch('/proveedores/api/listar')
            .then(r => r.json())
            .then(res => {
                if(res.data) {
                    const select = $('#proveedor_id');
                    select.find('option:not(:first)').remove();
                    res.data.filter(p => p.estado).forEach(p => {
                        select.append(`<option value="${p.id}">${p.nombre}</option>`);
                    });
                }
            });
    }

    let dataTable = $('#tablaProductos').DataTable({
        ajax: { url: `${API_BASE}/listar`, dataSrc: 'data' },
        columns: [
            {
                data: 'imagen',
                orderable: false,
                render: function(data) {
                    if (data) return `<img src="/uploads/${data}" alt="img" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">`;
                    return `<div class="bg-light text-secondary d-flex align-items-center justify-content-center border rounded" style="width: 50px; height: 50px;"><i class="bi bi-image fs-4"></i></div>`;
                }
            },
            { data: 'codigo', className: 'fw-bold text-secondary' },
            { data: 'nombre', className: 'fw-bold text-primary' },
            {
                data: 'categoria',
                render: data => data ? data.nombre : '<span class="text-danger">Sin Categoría</span>'
            },
            {
                data: 'precio',
                className: 'text-end fw-bold',
                render: data => `S/ ${parseFloat(data).toFixed(2)}`
            },
            {
                data: 'stock',
                className: 'text-center',
                render: data => data <= 5 ? `<span class="badge bg-danger rounded-pill">${data}</span>` : `<span class="badge bg-success rounded-pill">${data}</span>`
            },
            {
                data: 'estado',
                render: data => data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'
            },
            {
                data: null,
                orderable: false,
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

    const productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
    cargarCategorias();
    cargarProveedores();

    $('#btnNuevoRegistro').click(() => {
        $('#formProducto')[0].reset();
        $('#id').val('');
        $('#modalTitle').text('Nuevo Producto');
        productoModal.show();
    });

    $('#formProducto').submit(e => {
        e.preventDefault();

        // VALIDACIÓN 5: Límite de Peso de Imagen (Max 2MB)
        let fileInput = document.getElementById('imagenFile');
        if (fileInput.files.length > 0) {
            let fileSize = fileInput.files[0].size / 1024 / 1024; // en MB
            if (fileSize > 2) {
                Swal.fire('Archivo muy pesado', 'La imagen no puede pesar más de 2MB.', 'warning');
                return;
            }
        }

        // VALIDACIÓN ANTI-DOBLE CLIC
        const btnGuardar = $('#btnSubmitProducto');
        btnGuardar.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Guardando...');

        let formData = new FormData();
        if ($('#id').val()) formData.append("id", $('#id').val());

        formData.append("codigo", $('#codigo').val().trim());
        formData.append("nombre", $('#nombre').val().trim());
        formData.append("descripcion", $('#descripcion').val().trim());
        formData.append("precio", $('#precio').val());
        formData.append("stock", $('#stock').val());
        formData.append("categoria.id", $('#id_categoria').val());

        const proveedorId = $('#proveedor_id').val();
        if (proveedorId) formData.append("proveedor.id", proveedorId);

        if (fileInput.files.length > 0) {
            formData.append("imagenFile", fileInput.files[0]);
        }

        fetch(`${API_BASE}/guardar`, {
            method: 'POST',
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.success) {
                productoModal.hide();
                dataTable.ajax.reload();
                Swal.fire('Éxito', data.message, 'success');
            } else {
                Swal.fire('Atención', data.message, 'warning');
            }
        }).catch(() => Swal.fire('Error', 'Fallo de conexión.', 'error'))
          .finally(() => btnGuardar.prop('disabled', false).html('Guardar Producto'));
    });

    $('#tablaProductos tbody').on('click', '.action-edit', function() {
        fetch(`${API_BASE}/${$(this).data('id')}`)
            .then(r => r.json()).then(res => {
                if(res.success) {
                    const p = res.data;
                    $('#id').val(p.id);
                    $('#codigo').val(p.codigo);
                    $('#nombre').val(p.nombre);
                    $('#descripcion').val(p.descripcion);
                    $('#precio').val(p.precio);
                    $('#stock').val(p.stock);
                    $('#id_categoria').val(p.categoria ? p.categoria.id : '');
                    $('#proveedor_id').val(p.proveedor ? p.proveedor.id : '');
                    $('#imagenFile').val('');
                    $('#modalTitle').text('Editar Producto');
                    productoModal.show();
                }
            });
    });

    $('#tablaProductos tbody').on('click', '.action-status', function() {
        fetch(`${API_BASE}/cambiar-estado/${$(this).data('id')}`, { method: 'POST' })
            .then(() => dataTable.ajax.reload());
    });

    $('#tablaProductos tbody').on('click', '.action-delete', function() {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Solo se podrá eliminar si no tiene historial de ventas o inventario.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, intentar eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_BASE}/eliminar/${id}`, { method: 'DELETE' })
                    .then(r => r.json()).then(data => {
                        if(data.success) {
                            dataTable.ajax.reload();
                            Swal.fire('Eliminado', data.message, 'success');
                        } else {
                            Swal.fire('No permitido', data.message, 'error');
                        }
                    });
            }
        });
    });
});