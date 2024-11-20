const express = require("express");
const router = express.Router();
const OrdenTrabajo = require("../models/ordenes_trabajo");
const Paciente = require("../models/paciente");
const Muestra = require("../models/muestra");
const Examen = require("../models/examen");
const OrdenesExamen = require("../models/ordenes_examen");
const auditoriaController = require("../routes/AuditoriaRuta");
const TiposMuestra = require("../models/tipos_muestra");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Ruta para buscar un paciente y mostrar sus órdenes de trabajo
router.get("/ordenes", (req, res) => {
  res.render("buscarPacientesOrdenes");
});

// Ruta para manejar la búsqueda de órdenes de trabajo por DNI del paciente
router.post("/ordenes", async (req, res) => {
  try {
    const { dniPaciente } = req.body;

    const ordenesTrabajo = await OrdenTrabajo.findAll({
      where: { dni: dniPaciente, estado: { [Op.not]: "cancelada" } },
      include: {
        model: Paciente,
        attributes: ["nombre", "apellido", "dni", "id_Paciente"],
      },
      attributes: ["id_Orden", "Fecha_Creacion", "Fecha_Entrega", "estado", "id_Paciente"],
    });

    if (ordenesTrabajo.length === 0) {
      return res.json({ message: "No se encontraron órdenes para este paciente." });
    }

    res.json(ordenesTrabajo);
  } catch (error) {
    console.error("Error al buscar órdenes:", error);
    res.status(500).json({ error: "Error al buscar órdenes de trabajo." });
  }
});

// Ruta para obtener los detalles adicionales de una orden de trabajo
router.get("/detalles/:id_Orden", async (req, res) => {
  try {
    const { id_Orden } = req.params;

    const orden = await OrdenTrabajo.findByPk(id_Orden, {
      include: [
        {
          model: Paciente,
          attributes: ["nombre", "apellido", "dni"],
        },
        {
          model: Muestra,
          attributes: ["Tipo_Muestra", "Fecha_Recepcion", "estado"],
        },
      ],
    });

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    res.json(orden);
  } catch (error) {
    console.error("Error al obtener los detalles de la orden:", error);
    res.status(500).json({ error: "Error al obtener los detalles de la orden." });
  }
});

// Ruta para mostrar el formulario de creación/modificación de órdenes
router.get("/crear-modificar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;
    const orden = await OrdenTrabajo.findByPk(idOrden, {
      include: [
        {
          model: Muestra,
          attributes: ["idTipoMuestra", "Fecha_Recepcion", "estado"],
        },
        {
          model: OrdenesExamen,
          include: {
            model: Examen,
            attributes: ["nombre_examen", "id_examen"],
          },
        },
      ],
    });

    if (!orden) {
      return res.status(404).send("Orden no encontrada.");
    }
    const paciente = await Paciente.findByPk(orden.id_Paciente, {
      attributes: ["nombre", "apellido"],
    });

    if (!paciente) {
      return res.status(404).send("Paciente no encontrado.");
    }
    const examenes = await Examen.findAll({
      include: {
        model: TiposMuestra,
        as: "tipoMuestra",
        attributes: ["tipoDeMuestra"],
      },
    });

    res.render("crearModificarOrden", { orden, examenes, paciente });
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    res.status(500).send("Error al obtener la orden.");
  }
});

// Ruta para procesar la creación/modificación de órdenes
router.post("/crear-modificar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { estado, examenesSelectedIds, tipos_muestra } = req.body;

    const orden = await OrdenTrabajo.findByPk(idOrden);
    if (!orden) {
      return res.status(404).send("Orden no encontrada.");
    }

    orden.estado = estado;
    await orden.save();

    if (tipos_muestra) {
      await Muestra.destroy({ where: { id_Orden: idOrden } });

      for (const tipoMuestra of tipos_muestra) {
        const tipoMuestraId = await obtenerIdTipoMuestra(tipoMuestra);
        await Muestra.create({
          id_Orden: idOrden,
          idTipoMuestra: tipoMuestraId,
          Fecha_Recepcion: new Date(),
          estado: "pendiente",
        });
      }
    }

    if (examenesSelectedIds) {
      await OrdenesExamen.destroy({ where: { id_Orden: idOrden } });

      for (const id_examen of examenesSelectedIds.split(",")) {
        await OrdenesExamen.create({
          id_Orden: idOrden,
          id_examen: parseInt(id_examen),
        });
      }
    }

    res.send("Orden actualizada con éxito.");
  } catch (error) {
    console.error("Error al modificar la orden:", error);
    res.status(500).send("Error al modificar la orden.");
  }
});

// Ruta para cancelar una orden
router.post("/cancelar-orden/:idOrden", async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { descripcionCancelacion } = req.body;

    const orden = await OrdenTrabajo.findByPk(idOrden);
    if (!orden) {
      return res.status(404).send("Orden no encontrada.");
    }

    orden.estado = "cancelada";
    orden.descripcionCancelacion = descripcionCancelacion;
    await orden.save();

    res.redirect("/ordenes");
  } catch (error) {
    console.error("Error al cancelar la orden:", error);
    res.status(500).send("Error al cancelar la orden.");
  }
});

// Ruta para obtener órdenes informadas
router.get("/ordenes/informadas", async (req, res) => {
  try {
    const ordenes = await OrdenTrabajo.findAll({
      where: { estado: "informada" },
      include: [
        {
          model: Paciente,
          attributes: ["nombre", "apellido", "dni"],
        },
        {
          model: Muestra,
          attributes: ["Tipo_Muestra", "Fecha_Recepcion", "estado"],
        },
      ],
    });

    res.render("ordenesInformadas", { ordenes });
  } catch (error) {
    console.error("Error al obtener órdenes informadas:", error);
    res.status(500).send("Error al obtener órdenes informadas.");
  }
});

module.exports = router;
