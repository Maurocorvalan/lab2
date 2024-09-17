const express = require("express");
const router = express.Router();
const OrdenTrabajo = require("../models/ordenes_trabajo");
const Paciente = require("../models/paciente"); // Asegúrate de tener un modelo Paciente
const Muestra = require("../models/muestra");
const Examen = require("../models/examen");
const OrdenesExamen = require("../models/ordenes_examen");
const auditoriaController = require("../routes/AuditoriaRuta");
const { Op } = require("sequelize");

// Ruta para buscar un paciente y mostrar sus órdenes de trabajo
router.get("/ordenes", (req, res) => {
  res.render("buscarPacientesOrdenes"); // Renderiza la vista inicial para buscar paciente y órdenes
});

// Ruta para manejar la búsqueda de órdenes de trabajo por id_paciente
router.post("/ordenes", async (req, res) => {
  try {
    const dniPaciente = req.body.dniPaciente;
    console.log("ID del Paciente:", dniPaciente);

    // Buscar órdenes de trabajo por id_paciente
    const ordenesTrabajo = await OrdenTrabajo.findAll({
      where: { dni: dniPaciente, estado: { [Op.not]: "cancelada" } },
      attributes: [
        "id_Orden",
        "id_Paciente",
        "dni",
        "Fecha_Creacion",
        "Fecha_Entrega",
        "estado",
      ],
    });

    if (ordenesTrabajo.length === 0) {
      // No se encontraron órdenes de trabajo para el paciente
      res.json({
        message: "No se encontraron órdenes de trabajo para el paciente.",
      });
    } else {
      // Se encontraron órdenes de trabajo para el paciente
      res.json(ordenesTrabajo); // Enviar las órdenes de trabajo en formato JSON
    }
  } catch (error) {
    console.error("Error al buscar órdenes de trabajo:", error);
    res.status(500).json({ error: "Error al buscar órdenes de trabajo" });
  }
});
// Ruta para obtener los detalles adicionales de una orden de trabajo específica
router.get("/detalles/:id_Orden", async (req, res) => {
  try {
    const { id_Orden } = req.params;

    // Buscar la orden de trabajo por ID
    const orden = await OrdenTrabajo.findByPk(id_Orden);
    if (!orden) {
      return res.status(404).json({ error: "Orden de trabajo no encontrada." });
    }

    // Buscar los detalles del paciente
    const paciente = await Paciente.findOne({
      where: { id_Paciente: orden.id_Paciente },
    });
    if (!paciente) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    const datosAdicionales = {
      id_Orden: orden.id_Orden,
      id_Paciente: orden.id_Paciente,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      fecha_hora: orden.Fecha_Creacion, // Ajusta esto según tu esquema de base de datos
      estado: orden.estado,
    };

    res.json(datosAdicionales);
  } catch (error) {
    console.error(
      "Error al obtener los detalles de la orden de trabajo:",
      error
    );
    res
      .status(500)
      .json({ error: "Error al obtener los detalles de la orden de trabajo." });
  }
});
// Ruta para mostrar el formulario de modificación de órdenes de trabajo
router.get("/crear-modificar-orden/:idOrden", async (req, res) => {
  try {
    const tiposMuestra = [
      { value: "sangre", label: "Sangre" },
      { value: "orina", label: "Orina" },
      { value: "heces", label: "Heces" },
      { value: "liquidoCefaloraquideo", label: "Líquido Cefalorraquídeo" },
      { value: "saliva", label: "Saliva" },
      { value: "nasofaringea", label: "Secreción Nasofaríngea" },
    ];
    const examenes = await Examen.findAll();
    const { idOrden } = req.params;
    // Buscar la orden de trabajo específica incluyendo las muestras
    const ordenTrabajoExistente = await OrdenTrabajo.findByPk(idOrden, {
      include: [
        {
          model: Muestra,
          attributes: ["id_Muestra", "Tipo_Muestra", "Fecha_Recepcion"],
        },
        {
          model: OrdenesExamen,
          attributes: ["id_OrdenExamen", "id_examen"],
          where: {
            id_Orden: idOrden,
          },
          include: [Examen],
        },
      ],
    });

    // Si la orden de trabajo no existe, devuelve un mensaje de error
    if (!ordenTrabajoExistente) {
      return res.status(404).send("Orden de Trabajo no encontrada");
    }
    const estadoOrden = ordenTrabajoExistente.estado;

    res.render("crearModificarOrden", {
      tiposMuestra,
      ordenTrabajoExistente,
      examenes,
      estadoOrden,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la orden de trabajo.");
  }
});

// Ruta para procesar la creación/modificación de órdenes de trabajo
router.post("/crear-modificar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { estado, idPaciente, tipos_muestra, examenesSelectedIds } = req.body;

    const ordenTrabajoExistente = await OrdenTrabajo.findByPk(idOrden);

    if (ordenTrabajoExistente) {
      ordenTrabajoExistente.estado = estado;
      await ordenTrabajoExistente.save();
      if (!req.user || !req.user.dataValues) {
        return res
          .status(401)
          .send("Usuario no autenticado o datos de usuario no disponibles.");
      }

      // Obtener el ID del usuario
      const usuarioId = req.user.dataValues.id_Usuario;

      // Registro de auditoría
      await auditoriaController.registrar(
        usuarioId, // usuarioId
        "Modificación de Orden", // operación
        `Modificación del estado de la orden ${idOrden} a ${estado}` // detalles
      );
      // Verificar si se han seleccionado tipos de muestra y crearlas si es necesario
      if (Array.isArray(tipos_muestra) && tipos_muestra.length > -1) {
        try {
          for (const tipoMuestra of tipos_muestra) {
            const estadoValue = req.body[`estado_${tipoMuestra}`];
            // Crear y guardar la muestra en la base de datos
            const nuevaMuestra = await Muestra.create({
              id_Orden: idOrden,
              id_Paciente: idPaciente,
              Fecha_Recepcion: new Date(),
              Tipo_Muestra: tipoMuestra,
              estado: estadoValue,
            });
            console.log("Muestra creada:", nuevaMuestra);
          }
        } catch (error) {
          console.error("Error al crear la muestra:", error);
        }
      } else {
        console.log("No se seleccionaron tipos de muestra.");
      }

      // Verificar si se han seleccionado exámenes y crearlos si es necesario
      if (examenesSelectedIds) {
        // Convertir examenesSelectedIds a un array de IDs enteros válidos
        const examenesSelectedIdsArray = examenesSelectedIds
          .split(",")
          .map((id_examen) => parseInt(id_examen))
          .filter((id) => !isNaN(id)); // Filtrar cualquier NaN

        // Verificar que los IDs de examen sean válidos y existan en la base de datos
        const examenesExistentes = await Examen.findAll({
          where: {
            id_examen: examenesSelectedIdsArray,
          },
        });

        if (examenesExistentes.length !== examenesSelectedIdsArray.length) {
          return res
            .status(400)
            .send("Uno o más IDs de examen no son válidos.");
        }

        // Insertar los exámenes asociados a la orden si hay IDs válidos
        for (const examenId of examenesSelectedIdsArray) {
          await OrdenesExamen.create({
            id_Orden: idOrden,
            id_examen: examenId,
          });
        }
      }

      res.send("Orden de trabajo modificada con éxito.");
    } else {
      res.status(404).send("Orden de trabajo no encontrada.");
    }
  } catch (error) {
    console.error(
      "Error al procesar la orden de trabajo y las muestras:",
      error
    );
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para cancelar una orden de trabajo
router.get("/cancelar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;

    // Buscar la orden de trabajo específica
    const ordenTrabajoExistente = await OrdenTrabajo.findByPk(idOrden);

    // Si la orden de trabajo no existe, devuelve un mensaje de error
    if (!ordenTrabajoExistente) {
      return res.status(404).send("Orden de Trabajo no encontrada");
    }

    // Renderiza la vista para ingresar la descripción de la cancelación
    res.render("cancelarOrden", { ordenTrabajoExistente });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cancelar la orden de trabajo.");
  }
});

// Ruta para procesar la cancelación de una orden de trabajo
// Ruta para procesar la cancelación de una orden de trabajo
router.post("/cancelar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { descripcionCancelacion } = req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Buscar la orden de trabajo existente
    const ordenTrabajoExistente = await OrdenTrabajo.findByPk(idOrden);

    if (ordenTrabajoExistente) {
      // Si existe, actualiza el estado a "Cancelada" y agrega la descripción
      ordenTrabajoExistente.estado = "Cancelada";
      ordenTrabajoExistente.descripcionCancelacion = descripcionCancelacion;
      await ordenTrabajoExistente.save();

      console.log("Orden de trabajo cancelada con éxito.");

      // Registro de auditoría
      await auditoriaController.registrar(
        usuarioId, // usuarioId
        "Cancelación de Orden", // operación
        `Cancelación de la orden ${idOrden} con descripción: ${descripcionCancelacion}` // detalles
      );
    } else {
      // Si no existe, devuelve un mensaje de error
      return res.status(404).send("Orden de Trabajo no encontrada");
    }

    // Redirecciona a la página principal de órdenes después de cancelar
    res.redirect("/buscarOrdenes/ordenes");
  } catch (error) {
    console.error(
      "Error al procesar la cancelación de la orden de trabajo:",
      error
    );
    res
      .status(500)
      .send("Error al procesar la cancelación de la orden de trabajo.");
  }
});

module.exports = router;
