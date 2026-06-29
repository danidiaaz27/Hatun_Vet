function verificarEstadoCaja() {
    fetch(`${API_URL}/estado`)
        .then(r => r.json())
        .then(res => {
            if (!res.success) return;

            if (res.activo) {
                $('#seccionCerrada').hide();
                $('#seccionAbierta').show();

                montoAperturaSesion = parseFloat(res.sesion.montoApertura);
                procesarYRenderizar(res.movimientos);
                return;
            }

            $('#seccionAbierta').hide();
            $('#seccionCerrada').show();
            $('#txtMontoApertura').val('0.00');
        });
}