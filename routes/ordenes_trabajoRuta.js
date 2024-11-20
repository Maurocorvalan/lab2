const express = require("express");
const router = express.Router();
const OrdenTrabajo = require("../models/ordenes_trabajo");
const Muestra = require("../models/muestra");
const Examen = require("../models/examen");
const Paciente = require("../models/paciente");
const OrdenesExamenes = require("../models/ordenes_examen");
const auditoriaController = require("../routes/AuditoriaRuta");
const TiposMuestra = require("../models/tipos_muestra");

// Función para sumar días a una fecha
function sumarDias(fecha, dias) {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
router.get("/ordenes", (req, res) => {
  res.render("buscarPacientesOrdenes");
});
router.get("/generacion-orden", async (req, res) => {
  try {
    // Obtener exámenes con sus tipos de muestra relacionados
    const examenes = await Examen.findAll({
      include: {
        model: TiposMuestra,
        as: "tipoMuestra", // Alias configurado en las asociaciones
        attributes: ["idTipoMuestra", "tipoDeMuestra"], // Sólo traer los campos necesarios
      },
    });

    // Obtener todos los pacientes
    const pacientes = await Paciente.findAll({
      attributes: ["id_paciente", "nombre", "apellido", "dni"], // Traer los campos requeridos
    });

    // Renderizar la vista con los datos obtenidos
    res.render("generarOrden", { examenes, pacientes });
  } catch (error) {
    console.error("Error al obtener la lista de exámenes:", error);
    res.status(500).send("Error al obtener la lista de exámenes.");
  }
});
// Ruta para procesar la generación de orden
router.post("/generacion-orden", async (req, res) => {
  try {
    const {
      estado,
      tipos_muestra,
      id_paciente,
      examenesSelectedIds,
      dni_paciente,
    } = req.body;
    const user = req.user;

    // Verifica que req.user esté definido y tiene dataValues
    if (!user || !user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = user.dataValues.id_Usuario;

    // Verifica si id_paciente es null
    if (!id_paciente) {
      return res
        .status(400)
        .send("El valor de id_paciente es nulo o no válido.");
    }

    // Ahora puedes acceder al DNI del paciente usando la variable dni_paciente
    console.log("DNI del Paciente:", dni_paciente);

    // Crea una nueva orden de trabajo
    const nuevaOrden = await OrdenTrabajo.create({
      id_Paciente: id_paciente,
      estado,
      dni: dni_paciente,
      Fecha_Creacion: new Date(),
      // Calcula la Fecha_Entrega sumando 7 días a la Fecha_Creacion
      Fecha_Entrega: sumarDias(new Date(), 7),
    });
    const nuevaOrdenId = nuevaOrden.id_Orden;

    // Verifica si examenesSelectedIds está definido y no está vacío
    if (examenesSelectedIds && examenesSelectedIds.length > 0) {
      const examenesSelectedIdsArray = examenesSelectedIds
        .split(",")
        .map((id_examen) => parseInt(id_examen))
        .filter((id) => !isNaN(id)); // Filtra cualquier NaN

      // Inserta los exámenes asociados a la orden
      if (examenesSelectedIdsArray.length > 0) {
        for (const examenId of examenesSelectedIdsArray) {
          await OrdenesExamenes.create({
            id_Orden: nuevaOrdenId,
            id_examen: examenId,
          });
        }
      } else {
        console.warn("No se seleccionaron exámenes válidos.");
      }
    } else {
      console.warn("No se seleccionaron exámenes.");
    }

    // Verifica si tipos_muestra está definido y tiene elementos
    if (tipos_muestra && tipos_muestra.length > 0) {
      for (const tipoMuestra of tipos_muestra) {
        const estadoValue = req.body[`estado_${tipoMuestra}`];
        await Muestra.create({
          id_Orden: nuevaOrdenId,
          id_Paciente: id_paciente,
          Fecha_Recepcion: new Date(),
          Tipo_Muestra: tipoMuestra,
          estado: estadoValue,
        });
      }
    } else {
      console.warn("No se seleccionaron tipos de muestra.");
    }

    // Registro de auditoría
    await auditoriaController.registrar(
      usuarioId,
      "Generación de Orden de Trabajo",
      `Generación de una nueva orden con ID: ${nuevaOrdenId}`
    );

    // Redirigir según el rol del usuario
    if (req.isAuthenticated() && req.user && req.user.rol === "tecnico") {
      res.redirect("/tecnico");
    } else if (
      req.isAuthenticated() &&
      req.user &&
      req.user.rol === "recepcionista"
    ) {
      res.redirect("/recepcionista");
    } else if (
      req.isAuthenticated() &&
      req.user &&
      req.user.rol === "bioquimico"
    ) {
      res.redirect("/bioquimico");
    } else if (req.isAuthenticated() && req.user && req.user.rol === "admin") {
      res.redirect("/admin");
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    res.status(500).send("Error al procesar el formulario");
  }
});

module.exports = router;
