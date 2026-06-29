function iniciarModuloInsumos() {
    document.getElementById('btnJalarInsumo')
        .addEventListener('click', abrirModalInsumos);
    document.getElementById('insumoProducto')
        .addEventListener('change', manejarCambioInsumo);

    document.getElementById('formRegistrarInsumo')
        .addEventListener('submit', registrarInsumo);
}

function abrirModalInsumos() {
    if (!pacienteEnAtencionId) {
        Swal.fire(
            'Atención',
            'Debe iniciar atención a un paciente de la cola de espera primero.',
            'warning'
        );
        return;
    }
    fetch(`${API_URL}/${pacienteEnAtencionId}/consulta`)
        .then(r => r.json())
        .then(res => {
            if (res.success && res.data) {
                cargarCatalogoInsumos();
                cargarInsumosConsumidos();
                modalJalarInsumo.show();
                return;
            }

            Swal.fire(
                'Guarde el Registro Primero',
                'Debe guardar la anamnesis al menos una vez antes de registrar insumos.',
                'warning'
            );
        });
}

function cargarCatalogoInsumos() {
    fetch('/productos/api/listar')
        .then(r => r.json())
        .then(res => {
            if (!res.data) return;

            listaProductosInsumos = res.data.filter(p => p.estado);

            const select = document.getElementById('insumoProducto');
            select.innerHTML = '<option value="">Seleccione un insumo...</option>';

            listaProductosInsumos.forEach(p => {
                const fraccTxt = p.fraccionable
                    ? ` [Fraccionable: ${p.unidadMedida}]`
                    : ' [Unidad]';

                select.innerHTML += `
                    <option value="${p.id}">
                        ${p.nombre} (Código: ${p.codigo})${fraccTxt}
                    </option>`;
            });

            ocultarInfoInsumo();
        })
        .catch(err =>
            console.error('Error al cargar catálogo de insumos:', err)
        );
}

function manejarCambioInsumo() {
    const prodId = this.value;

    if (!prodId) {
        ocultarInfoInsumo();
        return;
    }

    const producto = listaProductosInsumos.find(prod => prod.id === prodId);

    if (producto) {
        mostrarInfoInsumoSeleccionado(producto);
    }
}

function registrarInsumo(e) {
    e.preventDefault();

    const prodId = document.getElementById('insumoProducto').value;
    const cantidad = parseFloat(document.getElementById('insumoCantidad').value);

    if (!prodId || isNaN(cantidad) || cantidad <= 0) {
        Swal.fire(
            'Cantidad inválida',
            'Ingrese una cantidad mayor a 0.',
            'warning'
        );
        return;
    }

    fetch(`${API_URL}/${pacienteEnAtencionId}/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productoId: prodId,
            cantidadUsada: cantidad
        })
    })
        .then(r => r.json())
        .then(res => manejarRespuestaRegistrarInsumo(res))
        .catch(err =>
            console.error('Error al registrar insumo:', err)
        );
}

function manejarRespuestaRegistrarInsumo(res) {
    if (res.success) {
        Swal.fire('Éxito', res.message, 'success');
        document.getElementById('insumoCantidad').value = '';

        cargarCatalogoInsumos();
        cargarInsumosConsumidos();
        return;
    }

    Swal.fire('Error', res.message, 'error');
}

function cargarInsumosConsumidos() {
    fetch(`${API_URL}/${pacienteEnAtencionId}/insumos`)
        .then(r => r.json())
        .then(insumos => renderInsumosConsumidos(insumos))
        .catch(err =>
            console.error('Error al cargar insumos consumidos:', err)
        );
}

function conectarBotonesRevertirInsumo() {
    document.querySelectorAll('.btn-revertir-insumo').forEach(btn => {
        btn.addEventListener('click', function() {
            revertirInsumo(this.getAttribute('data-id'));
        });
    });
}

function revertirInsumo(insumoId) {
    Swal.fire({
        title: '¿Retirar insumo?',
        text: 'Se reintegrará la cantidad al stock correspondiente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, retirar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) eliminarInsumo(insumoId);
    });
}

function eliminarInsumo(insumoId) {
    fetch(`${API_URL}/insumos/${insumoId}`, {
        method: 'DELETE'
    })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Retirado', res.message, 'success');
                cargarCatalogoInsumos();
                cargarInsumosConsumidos();
                return;
            }

            Swal.fire('Error', res.message, 'error');
        })
        .catch(err =>
            console.error('Error al revertir insumo:', err)
        );
}