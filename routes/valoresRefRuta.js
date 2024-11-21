const express = require("express");
const router = express.Router();
const ValoresReferencia = require("../models/valoresReferencia");
const Determinacion = require("../models/determinacion");
const UnidadMedida = require("../models/unidadMedida");
const auditoriaController = require("../routes/AuditoriaRuta");

router.get("/crear-valores", async (req, res) => {
  try {
    const determinaciones = await Determinacion.findAll({
      include: {
        model: UnidadMedida,
        as: "unidadMedida",
        attributes: ["nombreUnidadMedida"],
      },
    });

    const valoresReferenciaExistentes = await ValoresReferencia.findAll();

    res.render("crearValores", { determinaciones, valoresReferenciaExistentes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar la vista.");
  }
});
router.get("/valores/:idDeterminacion", async (req, res) => {
  try {
    const { idDeterminacion } = req.params;
    const valoresReferencia = await ValoresReferencia.findAll({
      where: { id_Determinacion: idDeterminacion },
      attributes: [
        "id_ValorReferencia",
        "Edad_Minima",
        "Edad_Maxima",
        "Sexo",
        "Valor_Referencia_Minimo",
        "Valor_Referencia_Maximo",
        "Estado", // Asegúrate de incluir el campo Estado
      ],
    });

    res.json({ valoresReferencia });
  } catch (error) {
    console.error("Error al obtener los valores de referencia:", error);
    res.status(500).send("Error al obtener los valores de referencia.");
  }
});
router.post("/guardar-valores", async (req, res) => {
  const { id_Determinacion, valoresReferencia } = req.body;

  try {
    for (const valor of valoresReferencia) {
      if (valor.id_ValorReferencia) {
        // Actualizar valores existentes
        await ValoresReferencia.update(
          {
            Edad_Minima: valor.Edad_Minima,
            Edad_Maxima: valor.Edad_Maxima,
            Sexo: valor.Sexo,
            Valor_Referencia_Minimo: valor.Valor_Referencia_Minimo,
            Valor_Referencia_Maximo: valor.Valor_Referencia_Maximo,
            Estado: valor.Estado,
          },
          { where: { id_ValorReferencia: valor.id_ValorReferencia } }
        );
      } else {
        // Crear nuevos valores
        await ValoresReferencia.create({
          id_Determinacion,
          Edad_Minima: valor.Edad_Minima,
          Edad_Maxima: valor.Edad_Maxima,
          Sexo: valor.Sexo,
          Valor_Referencia_Minimo: valor.Valor_Referencia_Minimo,
          Valor_Referencia_Maximo: valor.Valor_Referencia_Maximo,
          Estado: valor.Estado,
        });
      }
    }

    // Registrar en auditoría
    await auditoriaController.registrar(
      req.user.dataValues.id_Usuario,
      "Guardar Valores de Referencia",
      `Se guardaron valores de referencia para la determinación ID: ${id_Determinacion}`
    );

    res.status(200).send("Valores de referencia guardados con éxito.");
  } catch (error) {
    console.error("Error al guardar los valores de referencia:", error);
    res.status(500).send("Error al guardar los valores de referencia.");
  }
});

router.delete("/eliminar/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const valorReferencia = await ValoresReferencia.findByPk(id);
    if (!valorReferencia) {
      return res.status(404).json({ error: "Valor de referencia no encontrado." });
    }

    await valorReferencia.destroy();
    res.status(200).json({ message: "Valor de referencia eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar el valor de referencia:", error);
    res.status(500).json({ error: "Error al eliminar el valor de referencia." });
  }
});

module.exports = router;
