// modificarDeterminacionRuta.js
const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const Determinacion = require("../models/determinacion");
const auditoriaController = require("../routes/AuditoriaRuta");

// Ruta para mostrar el formulario de búsqueda y modificación de determinaciones
router.get("/modificar-determinacion", async (req, res) => {
  try {
    const examenes = await Examen.findAll();
    const determinaciones = await Determinacion.findAll();
    res.render("buscarModificarDeterminacion", { examenes, determinaciones });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error al obtener la lista de exámenes y determinaciones.");
  }
});

// Ruta para procesar la búsqueda de determinaciones según el id_examen
router.post("/buscar-determinacion", async (req, res) => {
  try {
    const { id_examen } = req.body;

    // Verifica si se proporcionó un ID de examen en el formulario
    if (!id_examen) {
      return res
        .status(400)
        .send("Debe proporcionar un ID de examen para realizar la búsqueda.");
    }

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Realiza la búsqueda de las determinaciones según el id_examen en la base de datos
    const determinacionesEncontradas = await Determinacion.findAll({
      where: { id_examen: id_examen },
    });

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Búsqueda de Determinaciones", // operación
      `Búsqueda de determinaciones para el examen con ID: ${id_examen}` // detalles
    );

    // Renderiza la misma página con la información de las determinaciones encontradas o un mensaje si no se encuentran
    res.render("buscarModificarDeterminacion", {
      determinacionesEncontradas,
    });
  } catch (error) {
    console.error("Error al procesar la búsqueda de determinaciones:", error);
    res.status(500).send("Error al procesar la búsqueda de determinaciones.");
  }
});

// Ruta para procesar la modificación del estado de determinaciones
router.post("/modificar-estado", async (req, res) => {
  try {
    const { id_Determinacion, estado } = req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    console.log("ID de determinación recibido:", id_Determinacion);
    console.log("Nuevo estado recibido:", estado);
    const determinacion = await Determinacion.findByPk(id_Determinacion);

    if (!determinacion) {
      return res.status(404).send("Determinación no encontrada");
    }

    determinacion.estado = parseInt(estado, 10);
    await determinacion.save();

    console.log("Estado de determinación modificado con éxito.");

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Modificación de Estado de Determinación", // operación
      `Modificación del estado de la determinación con ID: ${id_Determinacion} a ${estado}` // detalles
    );

    res.redirect("/modificar-determinacion/modificar-determinacion");
  } catch (error) {
    console.error("Error al modificar el estado de la determinación:", error);
    res.status(500).send("Error al modificar el estado de la determinación.");
  }
});

module.exports = router;
