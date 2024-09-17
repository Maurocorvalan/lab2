const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const Determinacion = require("../models/determinacion");
const auditoriaController = require("../routes/AuditoriaRuta");

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

// Ruta para crear una determinación
router.post("/crear-determinacion", async (req, res) => {
  try {
    const { id_examen, Nombre_Determinacion, Valor, Unidad_Medida, Sexo } =
      req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Crear la determinación
    await Determinacion.create({
      id_examen,
      Nombre_Determinacion,
      Valor,
      Unidad_Medida,
      Sexo,
      estado: true,
    });

    console.log("Determinación creada con éxito.");

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Creación de Determinación", // operación
      `Creación de una nueva determinación para el examen ${id_examen}. Nombre: ${Nombre_Determinacion}, Valor: ${Valor}, Unidad: ${Unidad_Medida}, Sexo: ${Sexo}` // detalles
    );

    // Redireccionar a la página de valores de referencia
    res.redirect("/valoresreferencia/crear-valores");
  } catch (error) {
    console.error("Error al crear la determinación:", error);
    res.status(500).send("Error al crear la determinación.");
  }
});

module.exports = router;
