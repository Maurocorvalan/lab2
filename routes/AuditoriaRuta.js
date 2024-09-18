const Auditoria = require("../models/auditoria"); // Asegúrate de que esta ruta sea correcta
const { Op } = require("sequelize");
const Usuario = require('../models/User');

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
      console.error("Error al registrar auditoría:", error);
      throw error; // Lanza el error para que pueda ser manejado por el controlador de rutas
    }
  },

 // Método para recuperar auditorías con filtros opcionales
 listarAuditorias: async (filtros) => {
    const { fechaInicio, fechaFin, descripcion, limit, offset } = filtros;
    const where = {};

    // Filtros de fecha
    if (fechaInicio && fechaFin) {
      where.Fecha_Hora_Operacion = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
      };
    }

    // Filtro de descripción
    if (descripcion) {
      where.Operacion_Realizada = {
        [Op.like]: `%${descripcion}%`,
      };
    }

    try {
      const { count, rows: auditorias } = await Auditoria.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          {
            model: Usuario,
            attributes: ['Nombre_Usuario'],
          }
        ],
      });

      const totalPages = Math.ceil(count / limit); // Calcular el total de páginas

      return { auditorias, totalPages };
    } catch (error) {
      console.error("Error al obtener auditorías:", error);
      throw error;
    }
  },

  // Método para buscar auditorías por descripción
  buscarPorDescripcion: async (descripcion) => {
    try {
      const auditorias = await Auditoria.findAll({
        where: {
          Operacion_Realizada: {
            [Op.like]: `%${descripcion}%`,
          },
        },
        include: [
          {
            model: Usuario,
            attributes: ['Nombre_Usuario'],
          }
        ],
      });

      return auditorias;
    } catch (error) {
      console.error("Error al buscar auditorías por descripción:", error);
      throw error;
    }
  }
};

module.exports = auditoriaController;