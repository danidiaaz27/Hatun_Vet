function iniciarSlots() {
    document.getElementById('medicoId').addEventListener('change', cargarSlots);
    document.getElementById('fechaCita').addEventListener('change', cargarSlots);
}

function cargarSlots() {
    const medicoId = document.getElementById('medicoId').value;
    const fecha = document.getElementById('fechaCita').value;
    const contenedor = document.getElementById('contenedorSlots');

    slotSeleccionado = null;
    document.getElementById('horaCita').value = '';
    contenedor.innerHTML = '';

    if (!medicoId || !fecha) return;

    contenedor.innerHTML =
        '<small class="text-muted"><span class="spinner-border spinner-border-sm me-1"></span> Cargando horarios...</small>';

    fetch(`/medicos/api/slots-disponibles?medicoId=${encodeURIComponent(medicoId)}&fecha=${fecha}`)
        .then(r => r.json())
        .then(res => mostrarSlots(res, contenedor))
        .catch(() => {
            contenedor.innerHTML =
                '<small class="text-danger"><i class="bi bi-x-circle me-1"></i>Error al cargar horarios.</small>';
        });
}

function mostrarSlots(res, contenedor) {
    contenedor.innerHTML = '';

    if (!res.success || !res.slots || res.slots.length === 0) {
        contenedor.innerHTML =
            '<small class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i>El médico no tiene horario disponible ese día.</small>';
        return;
    }

    res.slots.forEach(slot => agregarBotonSlot(slot, contenedor));
}

function agregarBotonSlot(slot, contenedor) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = slot;

    btn.addEventListener('click', function() {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        slotSeleccionado = slot;
        document.getElementById('horaCita').value = slot;
    });

    contenedor.appendChild(btn);
}