const Auditoria = require('../models/auditoria'); // Asegúrate de que esta ruta sea correcta

const auditoriaController = {
    // Registrar una nueva auditoría
    registrar: async (usuarioId, operacion, detalles) => {
        try {
            await Auditoria.create({
                id_Usuario: usuarioId,
                Fecha_Hora_Operacion: new Date(),
                Operacion_Realizada: operacion,
                Detalles_Adicionales: detalles,
            });
        } catch (error) {
            console.error('Error al registrar auditoría:', error);
            throw error; // Lanza el error para que pueda ser manejado por el controlador de rutas
        }
    },
    // Método para recuperar auditorías (ejemplo de funcionalidad extra)
    listarAuditorias: async (req, res) => {
        try {
            const auditorias = await Auditoria.findAll();
            res.status(200).json(auditorias);
        } catch (error) {
            res.status(500).send('Error al obtener auditorías');
        }
    },
};

module.exports = auditoriaController;
