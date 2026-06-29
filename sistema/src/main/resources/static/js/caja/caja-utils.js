function parsearFecha(fechaInput) {
    if (!fechaInput) return new Date();

    if (Array.isArray(fechaInput)) {
        return new Date(
            fechaInput[0],
            fechaInput[1] - 1,
            fechaInput[2],
            fechaInput[3] || 0,
            fechaInput[4] || 0,
            fechaInput[5] || 0
        );
    }

    return new Date(fechaInput);
}