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

router.get("/generacion-orden/:dni?", async (req, res) => {
  try {
    const { dni } = req.params;

    // Obtener exámenes con sus tipos de muestra relacionados
    const examenes = await Examen.findAll({
      include: {
        model: TiposMuestra,
        as: "tipoMuestra",
        attributes: ["idTipoMuestra", "tipoDeMuestra"],
      },
    });

    // Obtener todos los pacientes
    const pacientes = await Paciente.findAll({
      attributes: ["id_paciente", "nombre", "apellido", "dni"],
    });

    // Buscar el paciente por DNI si está disponible
    let pacienteSeleccionado = null;
    if (dni) {
      pacienteSeleccionado = await Paciente.findOne({
        where: { dni },
        attributes: ["id_paciente", "nombre", "apellido", "dni"],
      });
    }

    // Renderizar la vista con los datos
    res.render("generarOrden", {
      examenes,
      pacientes,
      pacienteSeleccionado, // Pasar el paciente preseleccionado
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).send("Error al cargar la página de generación de orden.");
  }
});



// Ruta para procesar la generación de ordenrouter.post("/generacion-orden", async (req, res) => {
  router.post("/generacion-orden", async (req, res) => {
    try {
      const {
        estado,
        examenesSelectedIds,
        id_paciente,
        dni_paciente,
        tipos_muestra, // Este campo debe ser un array
      } = req.body;
  
      const user = req.user;
      console.log("--------------------------->", req.body);
  
      // Verifica que el usuario esté autenticado
      if (!user || !user.dataValues) {
        return res
          .status(401)
          .send("Usuario no autenticado o datos de usuario no disponibles.");
      }
  
      const usuarioId = user.dataValues.id_Usuario;
  
      // Validar que el paciente esté definido
      if (!id_paciente || !dni_paciente) {
        return res
          .status(400)
          .send("El paciente debe estar seleccionado para generar una orden.");
      }
  
      // Validar que se seleccionaron exámenes
      if (!examenesSelectedIds || examenesSelectedIds.trim() === "") {
        return res
          .status(400)
          .send("Debe seleccionar al menos un examen para generar la orden.");
      }
  
      // Obtener los IDs de los exámenes seleccionados
      const examenesSelectedIdsArray = examenesSelectedIds
        .split(",")
        .map((id_examen) => parseInt(id_examen))
        .filter((id) => !isNaN(id)); // Filtrar valores no válidos
  
      if (examenesSelectedIdsArray.length === 0) {
        return res
          .status(400)
          .send("No se seleccionaron exámenes válidos.");
      }
  
      // Calcular el tiempo máximo de demora de los exámenes seleccionados
      const tiempoMaximoDemora = await Examen.max("tiempoDemora", {
        where: {
          id_examen: examenesSelectedIdsArray,
        },
      });
  
      if (!tiempoMaximoDemora) {
        return res
          .status(400)
          .send("No se pudo calcular el tiempo de demora de los exámenes.");
      }
  
      // Calcular la fecha de entrega
      const fechaEntrega = sumarDias(new Date(), tiempoMaximoDemora);
  
      // Crear una nueva orden de trabajo
      const nuevaOrden = await OrdenTrabajo.create({
        id_Paciente: id_paciente,
        estado,
        dni: dni_paciente,
        Fecha_Creacion: new Date(),
        Fecha_Entrega: fechaEntrega,
      });
  
      const nuevaOrdenId = nuevaOrden.id_Orden;
  
      // Asociar los exámenes a la orden
      for (const examenId of examenesSelectedIdsArray) {
        await OrdenesExamenes.create({
          id_Orden: nuevaOrdenId,
          id_examen: examenId,
        });
      }
  
      // Manejar los tipos de muestra seleccionados
      if (tipos_muestra) {
        const tiposMuestraArray = Array.isArray(tipos_muestra)
          ? tipos_muestra
          : [tipos_muestra];
  
        for (const tipoMuestra of tiposMuestraArray) {
          const idTipoMuestra = await obtenerIdTipoMuestra(tipoMuestra.trim());
  
          if (!idTipoMuestra) {
            console.warn(
              `El tipo de muestra "${tipoMuestra}" no tiene un ID asociado en la base de datos.`
            );
            continue;
          }
  
          await Muestra.create({
            id_Orden: nuevaOrdenId,
            id_Paciente: id_paciente,
            idTipoMuestra,
            Fecha_Recepcion: new Date(),
            estado: "pendiente",
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
      const rolesRedirect = {
        
        tecnico: "/tecnico",
        recepcionista: "/recepcionista",
        bioquimico: "/bioquimico",
        admin: "/admin",
      };
  
      const userRole = req.user.rol;
      if (req.isAuthenticated() && rolesRedirect[userRole]) {
        res.redirect(
          `${rolesRedirect[userRole]}?success=Orden+generada+con+éxito`
        );      } else {
        res.status(403).send("Acceso no autorizado");
      }
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      res.status(500).send("Error al procesar el formulario.");
    }
  });
  
  // Función para sumar días a una fecha
  function sumarDias(fecha, dias) {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  }
  
  // Función para obtener el ID de tipo de muestra por su nombre
  async function obtenerIdTipoMuestra(nombreTipoMuestra) {
    const tipoMuestra = await TiposMuestra.findOne({
      where: { tipoDeMuestra: nombreTipoMuestra },
    });
    return tipoMuestra ? tipoMuestra.idTipoMuestra : null;
  }
  

module.exports = router;
