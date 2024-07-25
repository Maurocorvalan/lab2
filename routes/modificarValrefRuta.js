// valoresReferenciaRuta.js
const express = require("express");
const router = express.Router();
const Determinacion = require("../models/determinacion");
const ValoresReferencia = require("../models/valoresReferencia");

// Ruta para mostrar el formulario de búsqueda y modificación de valores de referencia
router.get("/buscar-valores-referencia", async (req, res) => {
  try {
    const determinaciones = await Determinacion.findAll();
    res.render("buscarModificarValref", { determinaciones });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de determinaciones.");
  }
});

// Ruta para procesar la búsqueda de valores de referencia según la determinación
router.post("/buscar-valores-referencia", async (req, res) => {
  try {
    const { id_Determinacion } = req.body;

    // Verifica si se proporcionó un ID de determinación en el formulario
    if (!id_Determinacion) {
      return res
        .status(400)
        .send(
          "Debe proporcionar un ID de determinación para realizar la búsqueda."
        );
    }

    // Realiza la búsqueda de los valores de referencia según la determinación en la base de datos
    const valoresReferenciaEncontrados = await ValoresReferencia.findAll({
      where: { id_Determinacion: id_Determinacion },
    });

    // Renderiza la misma página con la información de los valores de referencia encontrados o un mensaje si no se encuentran
    res.render("buscarModificarValref", {
      valoresReferenciaEncontrados,
      determinacionSeleccionada: id_Determinacion,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error al procesar la búsqueda de valores de referencia.");
  }
});

// Ruta para mostrar el formulario de creación/modificación de valores de referencia
router.get("/crear-modificar-valores-referencia/:valorId", async (req, res) => {
  try {
    const { valorId } = req.params;

    // Buscar el valor de referencia específico
    const valorReferenciaExistente = await ValoresReferencia.findByPk(valorId);

    // Obtener todas las determinaciones
    const determinaciones = await Determinacion.findAll();

    res.render("crearModificarValref", {
      determinaciones,
      valorReferenciaExistente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener el valor de referencia.");
  }
});

// Ruta para procesar la creación o modificación de valores de referencia
router.post(
  "/crear-modificar-valores-referencia/:valorId",
  async (req, res) => {
    try {
      const { valorId } = req.params;
      const {
        Edad_Minima,
        Edad_Maxima,
        Sexo,
        Valor_Referencia_Minimo,
        Valor_Referencia_Maximo,
        estado,
      } = req.body;

      // Buscar el valor de referencia existente
      const valorReferenciaExistente = await ValoresReferencia.findByPk(
        valorId
      );

      if (valorReferenciaExistente) {
        // Si existe, actualiza los valores existentes
        valorReferenciaExistente.Edad_Minima = Edad_Minima;
        valorReferenciaExistente.Edad_Maxima = Edad_Maxima;
        valorReferenciaExistente.Sexo = Sexo;
        valorReferenciaExistente.Valor_Referencia_Minimo =
          Valor_Referencia_Minimo;
        valorReferenciaExistente.Valor_Referencia_Maximo =
          Valor_Referencia_Maximo;
        valorReferenciaExistente.estado = estado === "1";

        await valorReferenciaExistente.save();

        console.log("Valores de referencia modificados con éxito.");
      } else {
        // Si no existe, crea un nuevo valor de referencia
        const { id_Determinacion } = req.body;
        await ValoresReferencia.create({
          id_Determinacion,
          Edad_Minima,
          Edad_Maxima,
          Sexo,
          Valor_Referencia_Minimo,
          Valor_Referencia_Maximo,
          estado: estado === "1", // Convertir a booleano
        });

        console.log("Nuevo valor de referencia creado con éxito.");
      }

      res.redirect("/buscar-valores/buscar-valores-referencia");
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send(
          "Error al procesar la creación/modificación de valores de referencia."
        );
    }
  }
);

// Ruta para procesar la creación de un nuevo valor de referencia
router.post("/agregar-nuevo-valor-referencia", async (req, res) => {
  try {
    const {
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
      estado,
    } = req.body;

    await ValoresReferencia.create({
      id_Determinacion,
      Edad_Minima,
      Edad_Maxima,
      Sexo,
      Valor_Referencia_Minimo,
      Valor_Referencia_Maximo,
      estado: estado === "1", // Convertir a booleano
    });

    console.log("Nuevo valor de referencia creado con éxito.");

    res.redirect("/buscar-valores/buscar-valores-referencia");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error al procesar la creación de un nuevo valor de referencia.");
  }
});

module.exports = router;
