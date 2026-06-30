function iniciarPermisosPerfiles() {
    $('#tablaPerfiles tbody').on(
        'click',
        '.action-permissions',
        abrirModalPermisos
    );

    $('#btnGuardarPermisos').click(guardarPermisosPerfil);
}

async function abrirModalPermisos() {
    const id = $(this).data('id');

    $('#permisoPerfilId').val(id);

    const [perfilRes, opcionesRes] = await Promise.all([
        fetch(`${API_BASE}/${id}`).then(r => r.json()),
        fetch(`${API_BASE}/opciones`).then(r => r.json())
    ]);

    $('#permisoPerfilNombre').text(perfilRes.data.nombre);

    renderOpcionesPermisos(
        opcionesRes.data || [],
        perfilRes.data.opciones || []
    );

    permisosModal.show();
}

function renderOpcionesPermisos(opciones, opcionesPerfil) {
    const lista = $('#listaOpciones');
    lista.empty();

    opciones.forEach(op => {
        const checked = opcionesPerfil.includes(op.id) ? 'checked' : '';

        lista.append(`
            <label class="list-group-item d-flex align-items-center">
                <input class="form-check-input me-3"
                    type="checkbox"
                    value="${op.id}"
                    ${checked}>

                <i class="${op.icono} me-2 text-muted"></i>
                ${op.nombre}
            </label>
        `);
    });
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