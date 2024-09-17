const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const ValoresReferencia = require("../models/valoresReferencia");
const auditoriaController = require("../routes/AuditoriaRuta");

// Ruta para mostrar el formulario de creación de exámenes con valores de referencia
router.get("/crear-examen", async (req, res) => {
  try {
    res.render("crearExamen");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener.");
  }
});

// Ruta para procesar el formulario de creación de exámenes
router.post("/crear-examen", async (req, res) => {
  try {
    const { nombre_examen, descripcion, codigo } = req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res.status(401).send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Crea el examen
    const examen = await Examen.create({
      nombre_examen,
      descripcion,
      codigo,
      estado: true, // Establece el estado como true automáticamente
    });

    console.log("Examen creado con éxito:", examen);

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Creación de Examen", // operación
      `Creación de un nuevo examen. Nombre: ${nombre_examen}, Descripción: ${descripcion}, Código: ${codigo}` // detalles
    );

    // Redireccionar a la página de creación de determinación
    res.redirect("/determinacion/crear-determinacion");
  } catch (error) {
    console.error("Error al crear el examen:", error);
    res.status(500).send("Error al crear el examen.");
  }
});

module.exports = router;
