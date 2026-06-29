function formatFecha(fechaStr) {
    if (!fechaStr) return '';

    const parts = fechaStr.split('-');

    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return fechaStr;
}