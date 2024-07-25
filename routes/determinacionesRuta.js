const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const Determinacion = require("../models/determinacion");

// Ruta para mostrar el formulario de creación de determinaciones
router.get("/crear-determinacion", async (req, res) => {
  try {
    const examenes = await Examen.findAll();
    res.render("crearDeterminacion", { examenes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de exámenes.");
  }
});

// Ruta para procesar la creación de determinaciones

router.post("/crear-determinacion", async (req, res) => {
  try {
    const { id_examen, Nombre_Determinacion, Valor, Unidad_Medida, Sexo } =
      req.body;

    await Determinacion.create({
      id_examen,
      Nombre_Determinacion,
      Valor,
      Unidad_Medida,
      Sexo,
      estado: true,
    });

    console.log("Determinación creada con éxito.");
    res.redirect("/valoresreferencia/crear-valores");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear la determinación.");
  }
});

module.exports = router;
