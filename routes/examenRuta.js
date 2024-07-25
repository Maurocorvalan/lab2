const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const ValoresReferencia = require("../models/valoresReferencia");

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

    // Crea el examen
    const examen = await Examen.create({
      nombre_examen,
      descripcion,
      codigo,
      estado: true, // Establece el estado como true automáticamente
    });

    console.log("Examen creado con éxito:", examen);
    res.redirect("/determinacion/crear-determinacion");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear el examen con valores de referencia.");
  }
});

module.exports = router;
