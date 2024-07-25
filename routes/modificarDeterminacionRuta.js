// modificarDeterminacionRuta.js
const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const Determinacion = require("../models/determinacion");

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

    // Realiza la búsqueda de las determinaciones según el id_examen en la base de datos
    const determinacionesEncontradas = await Determinacion.findAll({
      where: { id_examen: id_examen },
    });

    // Renderiza la misma página con la información de las determinaciones encontradas o un mensaje si no se encuentran
    res.render("buscarModificarDeterminacion", {
      determinacionesEncontradas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al procesar la búsqueda de determinaciones.");
  }
});

// Ruta para procesar la modificación del estado de determinaciones
router.post("/modificar-estado", async (req, res) => {
  try {
    const { id_Determinacion, estado } = req.body;

    console.log("ID de determinación recibido:", id_Determinacion);
    console.log("Nuevo estado recibido:", estado);
    const determinacion = await Determinacion.findByPk(id_Determinacion);

    if (!determinacion) {
      return res.status(404).send("Determinación no encontrada");
    }

    determinacion.estado = parseInt(estado, 10);
    await determinacion.save();

    console.log("Estado de determinación modificado con éxito.");
    res.redirect("/modificar-determinacion/modificar-determinacion");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al modificar el estado de la determinación.");
  }
});

module.exports = router;
