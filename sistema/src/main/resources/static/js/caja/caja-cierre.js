function manejarRespuestaCierre(data, btn) {
    btn.prop('disabled', false).text('Efectuar Cierre');

    if (!data.success) {
        Swal.fire('Error', data.message, 'error');
        return;
    }

    modalCierre.hide();
    $('#formCierre')[0].reset();
    verificarEstadoCaja();

    mostrarResultadoCierre(data.sesion);
}

function mostrarResultadoCierre(sesion) {
    const esperado = parseFloat(sesion.montoCierreEsperado);
    const real = parseFloat(sesion.montoCierreReal);
    const dif = real - esperado;

    const msg = `Esperado: S/ ${esperado.toFixed(2)}
Físico: S/ ${real.toFixed(2)}`;

    if (dif === 0) {
        Swal.fire('Caja Cuadrada', msg, 'success');
    } else if (dif > 0) {
        Swal.fire('Cierre con Sobrante', `${msg}
Sobrante: S/ ${dif.toFixed(2)}`, 'warning');
    } else {
        Swal.fire('Cierre con Faltante', `${msg}
Faltante: S/ ${Math.abs(dif).toFixed(2)}`, 'error');
    }
}