function iniciarAccionesPromociones() {
    $('#promocionesGrid').on('click', '.action-edit', editarPromocion);
    $('#promocionesGrid').on('click', '.action-delete', confirmarEliminarPromocion);
}

function editarPromocion() {
    const id = $(this).data('id');

    const promo = promociones.find(p => p.id === id);

    if (promo) {
        cargarPromocionEnModal(promo);
    }
}

function cargarPromocionEnModal(promo) {
    $('#id').val(promo.id);
    $('#nombre').val(promo.nombre);
    $('#descripcion').val(promo.descripcion);
    $('#tipo').val(promo.tipo).trigger('change');
    $('#valor').val(promo.valor);
    $('#fechaInicio').val(promo.fechaInicio);
    $('#fechaFin').val(promo.fechaFin);
    $('#estado').val(promo.estado);
    $('#compraMinima').val(promo.compraMinima);

    $('#productoId').val(promo.producto ? promo.producto.id : '');
    $('#categoriaId').val(promo.categoria ? promo.categoria.id : '');
    $('#productoRegaloId').val(promo.productoRegalo ? promo.productoRegalo.id : '');

    $('#modalTitle').text('Editar Promoción');
    promocionModal.show();
}

function confirmarEliminarPromocion() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar Promoción?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#D32F2F',
        confirmButtonText: 'Sí, eliminar'
    }).then(result => {
        if (result.isConfirmed) eliminarPromocion(id);
    });
}

function eliminarPromocion(id) {
    fetch(`${API_BASE}/eliminar/${id}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                cargarPromociones();
                Swal.fire('Eliminada', data.message, 'success');
                return;
            }

            Swal.fire('Error', data.message, 'error');
        });
}