function iniciarAccionesMascotas() {
    $('#btnNuevaMascota').click(abrirNuevaMascota);
    $('#btnRecargar').click(recargarMascotas);
    $('#clienteId').change(actualizarDuenoSeleccionado);
    $('#btnMostrarRegistroRapido').click(mostrarRegistroRapidoDueno);
    $('#tablaMascotas tbody').on('click', '.btn-editar', editarMascota);
    $('#tablaMascotas tbody').on('click', '.btn-eliminar', confirmarEliminarMascota);
    $('#formMascota').submit(guardarMascota);
    iniciarRestriccionesMascota();
}

function abrirNuevaMascota() {
    prepararFormulario();
    cargarClientesSeleccion().finally(() => modalMascota.show());
}

function recargarMascotas() {
    $('#txtBusqueda').val('');
    $('#filtroEspecie').val('');
    cargarMascotas(`${API_URL}/listar`, 'Listado general');
}

function actualizarDuenoSeleccionado() {
    const selectedId = $(this).val();
    const cliente = clientesCache.find(c => String(c.id) === String(selectedId));
    setLabelDuenoSeleccionado(cliente || null);
}

function editarMascota() {
    const id = $(this).data('id');

    fetch(`${API_URL}/${id}`)
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                prepararFormulario(res.data);
                cargarClientesSeleccion().then(() => modalMascota.show());
                return;
            }

            Swal.fire('Atención', res.message || 'Mascota no encontrada', 'warning');
        })
        .catch(() => Swal.fire('Error', 'No se pudo cargar la mascota', 'error'));
}

function confirmarEliminarMascota() {
    const id = $(this).data('id');

    Swal.fire({
        title: '¿Eliminar mascota?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
    }).then(result => {
        if (result.isConfirmed) eliminarMascota(id);
    });
}

function eliminarMascota(id) {
    fetch(`${API_URL}/eliminar/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                Swal.fire('Eliminada', 'La mascota fue eliminada correctamente.', 'success');
                cargarMascotas(`${API_URL}/listar`, 'Listado general');
                return;
            }

            Swal.fire('Atención', res.message || 'No se pudo eliminar', 'warning');
        })
        .catch(() => Swal.fire('Error', 'No se pudo eliminar la mascota', 'error'));
}

function guardarMascota(e) {
    e.preventDefault();

    const id = $('#id').val().trim();
    const clienteId = normalizarTexto($('#clienteId').val());
    const tieneClienteExistente = clienteId !== '';
    const tieneRegistroRapido =
        !tieneClienteExistente &&
        normalizarTexto($('#numeroDocumento').val()) &&
        normalizarTexto($('#nombreCompleto').val());

    if (!validarPropietarioMascota(id, tieneClienteExistente, tieneRegistroRapido)) return;
    if (!validarDatosMascota()) return;

    if (!id && tieneRegistroRapido) {
        guardarRegistroRapidoMascota();
        return;
    }

    guardarMascotaNormal();
}
function mostrarRegistroRapidoDueno() {
    $('#panelRegistroRapidoDueno').removeClass('d-none');
    $('#clienteId').val('');
    setLabelDuenoSeleccionado(null);
}