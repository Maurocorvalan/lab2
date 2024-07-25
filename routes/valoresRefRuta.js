const express = require("express");
const router = express.Router();
const ValoresReferencia = require("../models/valoresReferencia");
const Determinacion = require("../models/determinacion");
// Ruta para mostrar el formulario de creación de valores de referencia
router.get("/crear-valores", async (req, res) => {
  try {
    const determinaciones = await Determinacion.findAll();
    res.render("crearValores", { determinaciones });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de determinaciones.");
  }
});
// Ruta para procesar la creación de valores de referencia
router.post("/crear-valores", async (req, res) => {
  try {
    const {
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
    } = req.body;

    await ValoresReferencia.create({
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
      estado: true, // Establece el estado como true automáticamente
    });

    console.log("Valores de referencia creados con éxito.");
    res.redirect("/tecnico"); // Redirige a la página de inicio o a la que desees
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear los valores de referencia.");
  }
});
module.exports = router;
