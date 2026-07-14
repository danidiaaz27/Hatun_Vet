function iniciarPermisosPerfiles() {
    $('#tablaPerfiles tbody').on(
        'click',
        '.action-permissions',
        abrirModalPermisos
    );

    $('#btnGuardarPermisos').click(guardarPermisosPerfil);
    $('#btnMarcarTodosPermisos').click(marcarTodosPermisos);
    $('#btnLimpiarPermisos').click(limpiarPermisos);
}

async function abrirModalPermisos() {
    const id = $(this).data('id');

    $('#permisoPerfilId').val(id);

    const [perfilRes, opcionesRes] = await Promise.all([
        fetch(`${API_BASE}/${id}`).then(r => r.json()),
        fetch(`${API_BASE}/opciones`).then(r => r.json())
    ]);

    $('#permisoPerfilNombre').text(perfilRes.data.nombre);
    $('#permisoPerfilNombreResumen').text(perfilRes.data.nombre);
    $('#permisoPerfilDescripcion').text(perfilRes.data.descripcion || 'Perfil del sistema');

    renderOpcionesPermisos(
        opcionesRes.data || [],
        perfilRes.data.opciones || []
    );

    actualizarContadorPermisos();
    permisosModal.show();
}

function renderOpcionesPermisos(opciones, opcionesPerfil) {
    const lista = $('#listaOpciones');
    lista.empty();

    const grupos = agruparOpciones(opciones);

    Object.keys(grupos).forEach(nombreGrupo => {
        lista.append(crearGrupoPermisos(nombreGrupo, grupos[nombreGrupo], opcionesPerfil));
    });

    $('#listaOpciones input[type="checkbox"]').on('change', actualizarContadorPermisos);
}

function agruparOpciones(opciones) {
    return {
        'General': opciones.filter(op =>
            contiene(op.nombre, ['Dashboard'])
        ),
        'Ventas': opciones.filter(op =>
            contiene(op.nombre, ['Punto de Venta', 'Historial de Ventas', 'Control de Caja', 'Promociones'])
        ),
        'Atención Veterinaria': opciones.filter(op =>
            contiene(op.nombre, ['Agenda', 'Torre de Control', 'Baños y Cortes', 'Mascotas', 'Clientes'])
        ),
        'Inventario': opciones.filter(op =>
            contiene(op.nombre, ['Categorías', 'Productos', 'Proveedores', 'Inventario'])
        ),
        'Reportes y Configuración': opciones.filter(op =>
            contiene(op.nombre, ['Reportes', 'Horarios', 'Configuración'])
        )
    };
}

function contiene(nombre, palabras) {
    return palabras.some(palabra =>
        nombre.toLowerCase().includes(palabra.toLowerCase())
    );
}

function crearGrupoPermisos(nombreGrupo, opciones, opcionesPerfil) {
    if (!opciones || opciones.length === 0) return '';

    const iconoGrupo = obtenerIconoGrupo(nombreGrupo);

    const items = opciones.map(op => {
        const checked = opcionesPerfil.includes(op.id) ? 'checked' : '';

        return `
            <label class="permiso-item">
                <input class="form-check-input permiso-check"
                    type="checkbox"
                    value="${op.id}"
                    ${checked}>

                <span class="permiso-icono">
                    <i class="${op.icono || 'bi bi-circle'}"></i>
                </span>

                <span class="permiso-nombre">${op.nombre}</span>
            </label>
        `;
    }).join('');

    return `
        <div class="permiso-grupo">
            <div class="permiso-grupo-titulo">
                <i class="${iconoGrupo}"></i>
                <span>${nombreGrupo}</span>
            </div>
            <div class="permiso-grupo-body">
                ${items}
            </div>
        </div>
    `;
}

function obtenerIconoGrupo(nombreGrupo) {
    const iconos = {
        'General': 'bi bi-grid-1x2-fill',
        'Ventas': 'bi bi-cart-fill',
        'Atención Veterinaria': 'bi bi-heart-pulse-fill',
        'Inventario': 'bi bi-box-seam-fill',
        'Reportes y Configuración': 'bi bi-graph-up-arrow'
    };

    return iconos[nombreGrupo] || 'bi bi-folder-fill';
}

function actualizarContadorPermisos() {
    const total = $('#listaOpciones input[type="checkbox"]').length;
    const seleccionados = $('#listaOpciones input[type="checkbox"]:checked').length;

    $('#contadorPermisos').text(`${seleccionados} / ${total}`);
}

function marcarTodosPermisos() {
    $('#listaOpciones input[type="checkbox"]').prop('checked', true);
    actualizarContadorPermisos();
}

function limpiarPermisos() {
    $('#listaOpciones input[type="checkbox"]').prop('checked', false);
    actualizarContadorPermisos();
}

async function guardarPermisosPerfil() {
    const perfilId = $('#permisoPerfilId').val();

    const opcionesSeleccionadas = $('#listaOpciones input:checked')
        .map(function() {
            return { id: $(this).val() };
        })
        .get();

    const perfilRes = await fetch(`${API_BASE}/${perfilId}`)
        .then(r => r.json());

    const perfilToUpdate = {
        ...perfilRes.data,
        opciones: opcionesSeleccionadas
    };

    fetch(`${API_BASE}/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilToUpdate)
    }).then(() => {
        permisosModal.hide();
        Swal.fire('Permisos Actualizados', '', 'success');
    });
}