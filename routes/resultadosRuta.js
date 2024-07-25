const express = require("express");
const router = express.Router();
const Muestra = require("../models/muestra");
const Paciente = require("../models/paciente");
const PDFDocument = require("pdfkit");
const Examen = require("../models/examen");
const Determinacion = require("../models/determinacion");
const Resultado = require("../models/resultados");
const ValoresReferencia = require('../models/valoresReferencia');
const fs = require("fs");

// Ruta para buscar y mostrar muestras asociadas a una orden
router.get("/mostrar/:id_orden", async (req, res) => {
  const id_orden = req.params.id_orden;

  try {
    const muestras = await Muestra.findAll({
      where: { id_Orden: id_orden },
      include: [{ model: Paciente, as: "Paciente" }],
    });

    if (muestras.length > 0) {
      res.render("muestrasOrden", { id_orden, muestras });
    } else {
      res.render("muestrasOrden", {
        mensaje: "No se encontraron muestras para esta orden de trabajo.",
      });
    }
  } catch (error) {
    console.error("Error al buscar muestras:", error);
    res.status(500).json({ error: "Error al buscar muestras" });
  }
});

// Ruta para generar el PDF de una muestra específica utilizando pdfkit
router.get("/:id_orden/generarPDFMuestra/:idMuestra", async (req, res) => {
  const idMuestra = req.params.idMuestra;

  try {
    const muestra = await Muestra.findByPk(idMuestra, {
      include: [{ model: Paciente, as: "Paciente" }],
    });

    if (!muestra) {
      return res.status(404).json({ mensaje: "Muestra no encontrada." });
    }

    const pdfDoc = new PDFDocument();

    // Construir el contenido del PDF
    pdfDoc.fontSize(12).text("Información de la Muestra\n\n");

    pdfDoc.font('Helvetica-Bold');
    pdfDoc.text(`Nombre del Paciente: ${muestra.Paciente.nombre} ${muestra.Paciente.apellido}\n`);
    pdfDoc.text(`Nro Muestra: ${muestra.id_Muestra}\n`);
    pdfDoc.text(`Nro Orden: ${muestra.id_Orden}\n`);
    pdfDoc.text(`Nro Paciente: ${muestra.id_Paciente}\n`);
    pdfDoc.text(`Tipo de Muestra: ${muestra.Tipo_Muestra}\n`);
    pdfDoc.text(`Fecha de Recepción: ${
      muestra.Fecha_Recepcion
        ? new Date(muestra.Fecha_Recepcion).toLocaleString()
        : ""
    }\n`);
    pdfDoc.text(`Estado: ${muestra.estado}\n`);

    // Finalizar el documento PDF
    pdfDoc.end();

    // Obtener el contenido del PDF en formato base64
    const pdfBytes = await new Promise((resolve, reject) => {
      const chunks = [];
      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", (error) => reject(error));
    });

    const pdfBase64 = pdfBytes.toString("base64");

    // Enviar el contenido del PDF como respuesta JSON al cliente
    res.json({ pdfBase64 });

  } catch (error) {
    console.error("Error al obtener muestra para PDF:", error);
    res.status(500).json({ error: "Error al obtener muestra para PDF" });
  }
});
// Ruta para mostrar la vista de añadir resultados
router.get("/mostrar/aniadirResultados/:id_muestra", async (req, res) => {
  const id_muestra = req.params.id_muestra;

  try {
    // Buscar la muestra por ID
    const muestra = await Muestra.findByPk(id_muestra);

    if (!muestra) {
      return res.status(404).json({ mensaje: "Muestra no encontrada." });
    }

    // Obtener el tipo de muestra
    const tipo_muestra = muestra.Tipo_Muestra;

    // Consultar los exámenes que coinciden con el tipo de muestra
    const examenes = await Examen.findAll({ where: { tipo_muestra } });

    // Obtener todos los id_examen
    const id_examenes = examenes.map(examen => examen.id_examen);

    // Consultar las determinaciones que coinciden con los id_examen
    const determinaciones = await Determinacion.findAll({
      where: { id_examen: id_examenes }
    });

    res.render("aniadirResultados", { muestra, determinaciones });
  } catch (error) {
    console.error("Error al buscar determinaciones:", error);
    res.status(500).json({ error: "Error al buscar determinaciones" });
  }
});

// Ruta para obtener valores de referencia según la determinación seleccionada
router.get('/mostrar/aniadirResultados/:id_muestra/valoresReferencia/:id_determinacion', async (req, res) => {
  const id_determinacion = req.params.id_determinacion;

  try {
    const valoresReferencia = await ValoresReferencia.findAll({
      where: { id_Determinacion: id_determinacion },
      attributes: {
        exclude: ['estado'], // Excluir el campo "estado"
      },
    });

    res.json(valoresReferencia);
  } catch (error) {
    console.error('Error al obtener valores de referencia:', error);
    res.status(500).json({ error: 'Error al obtener valores de referencia' });
  }
});


// Ruta para añadir un resultado
router.post("/mostrar/aniadirResultados/:id_muestra", async (req, res) => {
  const id_muestra = req.params.id_muestra;
  const { id_determinacion, valor_final, unidad_medida, custom_unidad_medida } = req.body;

  try {
    // Determinar la unidad de medida a usar
    const unidadMedida = unidad_medida === 'custom' ? custom_unidad_medida : unidad_medida;

    // Concatenar valor_final con unidad de medida
    const valorFinalConUnidad = unidadMedida ? `${valor_final} ${unidadMedida}` : valor_final;
    // Obtener id_Orden desde la muestra
    const muestra = await Muestra.findByPk(id_muestra);
    const id_Orden = muestra.id_Orden; // Captura id_Orden
    console.log("aca esta el id de la orden: "+id_Orden);
    // Crear un nuevo resultado
    await Resultado.create({
      id_Muestra: id_muestra,
      id_determinacion,
      valor_final: valorFinalConUnidad,
      id_Orden,
      fecha_resultado: new Date()
      
    });



    res.redirect(`/muestras/mostrar/${id_Orden}`); // Redirige a la vista de muestras
  } catch (error) {
    console.error("Error al añadir resultado:", error);
    res.status(500).json({ error: "Error al añadir resultado" });
  }
});


module.exports = router;
