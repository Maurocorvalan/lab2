const express = require("express");
const router = express.Router();
const Examen = require("../models/examen");
const auditoriaController = require("../routes/AuditoriaRuta");

// Ruta para buscar y modificar exámenes
router.get("/buscar-modificar-examen", async (req, res) => {
  try {
    // Obtener todos los exámenes
    const examenes = await Examen.findAll();

    res.render("buscarModificarExamen", { examenes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los exámenes.");
  }
});

// Ruta para procesar la búsqueda y mostrar el formulario de modificación
router.post("/buscar-modificar-examen", async (req, res) => {
  try {
    const { codigo } = req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res.status(401).send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Buscar el examen por código en lugar de ID
    const examen = await Examen.findOne({ where: { codigo } });

    if (!examen) {
      return res.status(404).send("Examen no encontrado");
    }

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Búsqueda de Examen", // operación
      `Búsqueda del examen con código: ${codigo}` // detalles
    );

    res.render("buscarModificarExamen", { examen });
  } catch (error) {
    console.error("Error al buscar y modificar el examen:", error);
    res.status(500).send("Error al buscar y modificar el examen.");
  }
});

// Ruta para procesar la modificación del examen
router.post("/modificar", async (req, res) => {
  try {
    const { id_examen, nombre_examen, descripcion, codigo, estado } = req.body;

    // Verifica que req.user esté definido y tiene dataValues
    if (!req.user || !req.user.dataValues) {
      return res.status(401).send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Obtén el examen por ID
    const examen = await Examen.findByPk(id_examen);

    if (!examen) {
      return res.status(404).send("Examen no encontrado");
    }

    // Asigna nuevos valores
    examen.nombre_examen = nombre_examen;
    examen.descripcion = descripcion;
    examen.codigo = codigo;
    examen.estado = parseInt(estado, 10);

    // Actualiza el examen en la base de datos
    await examen.save();

    console.log("Examen modificado con éxito.");

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId, // usuarioId
      "Modificación de Examen", // operación
      `Modificación del examen con ID: ${id_examen}. Nuevos valores: nombre_examen: ${nombre_examen}, descripcion: ${descripcion}, codigo: ${codigo}, estado: ${estado}` // detalles
    );

    res.redirect("/modificar-examen/buscar-modificar-examen");
  } catch (error) {
    console.error("Error al modificar el examen:", error);
    res.status(500).send("Error al modificar el examen.");
  }
});


module.exports = router;
