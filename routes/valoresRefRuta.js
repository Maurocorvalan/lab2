const express = require("express");
const router = express.Router();
const ValoresReferencia = require("../models/valoresReferencia");
const Determinacion = require("../models/determinacion");
const auditoriaController = require("../routes/AuditoriaRuta");

// Ruta para mostrar el formulario de creación de valores de referencia
router.get("/crear-valores", async (req, res) => {
  try {
    const determinaciones = await Determinacion.findAll();
    res.render("crearValores", { determinaciones });
  } catch (error) {
    error(error);
    res.status(500).send("Error al obtener la lista de determinaciones.");
  }
});

// Ruta para procesar la creación de valores de referencia
router.post("/crear-valores", async (req, res) => {
  // Verifica que req.user esté definido y tiene dataValues
  if (!req.user || !req.user.dataValues) {
    return res
      .status(401)
      .send("Usuario no autenticado o datos de usuario no disponibles.");
  }

  const usuarioId = req.user.dataValues.id_Usuario;

  try {
    const {
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
    } = req.body;

    // Crear los valores de referencia
    await ValoresReferencia.create({
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
      estado: true, // Establece el estado como true automáticamente
    });

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId,
      "Crear Valores de Referencia",
      `Valores de referencia creados para determinación ID: ${id_Determinacion}`
    );

    log("Valores de referencia creados con éxito.");
    res.redirect("/tecnico"); // Redirige a la página de inicio o la que prefieras
  } catch (error) {
    error("Error al crear los valores de referencia:", error);
    res.status(500).send("Error al crear los valores de referencia.");
  }
});
module.exports = router;
