const express = require("express");
const router = express.Router();
const Paciente = require("../models/paciente");
const Usuarios = require("../models/User");
const bcrypt = require("bcrypt");
const auditoriaController = require("../routes/AuditoriaRuta");

router.get("/ingresar-paciente", (req, res) => {
  res.render("ingresarPaciente", { paciente: null, mensaje: null }); // Renderiza el formulario de ingreso de pacientes
});
router.get("/buscar-paciente", (req, res) => {
  res.render("busquedaPaciente");
});
router.post("/buscar-paciente", async (req, res) => {
  const searchType = req.body.searchType;
  const searchTerm = req.body.searchTerm;

  try {
    const whereCondition = {};

    if (searchType === "dni") {
      whereCondition.dni = searchTerm;
    } else if (searchType === "apellido") {
      //  Buscar todos los pacientes con el mismo apellido
      const pacientes = await Paciente.findAll({
        where: { apellido: searchTerm },
      });

      if (pacientes.length > 1) {
        // Si hay múltiples pacientes con el mismo apellido, mostrar una lista para seleccionar
        res.render("seleccionarPaciente", {
          pacientes,
          searchTerm,
          searchType,
        });
        return;
      } else if (pacientes.length === 1) {
        // Si se encuentra un paciente, redirigir a la página de edición
        res.redirect(`/editar-paciente/${pacientes[0].id_paciente}`);
        return;
      }
    } else if (searchType === "email") {
      whereCondition.email = searchTerm;
    }

    const paciente = await Paciente.findOne({ where: whereCondition });

    if (paciente) {
      // Si se encuentra un paciente, redirigir a la página de edición
      res.redirect(`/editar-paciente/${paciente.id_paciente}`);
    } else {
      // Si no se encuentra un paciente, redirigir a la misma página con el mensaje
      res.render("busquedaPaciente", {
        paciente: null,
        mensaje: "Paciente no encontrado.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al buscar paciente por DNI, apellido o email.");
  }
});

// Controlador para seleccionar un paciente de la lista
router.get("/editar-paciente/:id", async (req, res) => {
  const { id } = req.params;
  const { searchTerm, searchType } = req.query;

  try {
    const paciente = await Paciente.findByPk(id);

    if (paciente) {
      // Configura la variable fechaNacimiento
      const fechaNacimiento = paciente.fecha_nacimiento;

      // Agrega la línea de registro
      console.log("Fecha de nacimiento:", fechaNacimiento);

      // Renderiza el formulario con los campos llenos, pasando el valor de "fechaNacimiento"
      res.render("ingresarPaciente", {
        paciente,
        fechaNacimiento,
        mensaje: "Paciente seleccionado:",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al seleccionar paciente para edición.");
  }
});
// Ruta para procesar la creación o actualización de pacientes
// Ruta para procesar la creación o actualización de pacientes

router.post("/guardar-paciente", async (req, res) => {
  try {
    const {
      dni,
      nombre,
      apellido,
      direccion,
      email,
      telefono,
      fecha_nacimiento,
      genero,
      embarazo,
      diagnostico,
    } = req.body;

    if (!req.user || !req.user.dataValues) {
      return res
        .status(401)
        .send("Usuario no autenticado o datos de usuario no disponibles.");
    }

    const usuarioId = req.user.dataValues.id_Usuario;

    // Consultar si el paciente ya existe por su DNI
    const existingPaciente = await Paciente.findOne({ where: { dni } });

    if (existingPaciente) {
      // Actualizar los datos del paciente existente
      await existingPaciente.update({
        nombre,
        apellido,
        dni,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        genero,
        embarazo,
        diagnostico,
      });
      console.log("Datos del paciente actualizados con éxito:", dni);

      // Actualizar el usuario asociado al paciente
      const existingUsuario = await Usuarios.findOne({
        where: { correo_electronico: existingPaciente.email },
      });

      if (existingUsuario) {
        await existingUsuario.update({
          nombre_usuario: `${nombre} ${apellido}`,
          correo_electronico: email,
        });
        console.log("Usuario actualizado con éxito:", email);
      }else {
        // Crear un usuario asociado al paciente
        const hashedPassword = await bcrypt.hash(dni, 10); // Hashea el DNI como contraseña por defecto
        await Usuarios.create({
          nombre_usuario: `${nombre} ${apellido}`,
          rol: "paciente",
          correo_electronico: email,
          password: hashedPassword,
        });
      }

      // Registro de auditoría
      await auditoriaController.registrar(
        usuarioId,
        "Actualización de Paciente",
        `Actualización de datos del paciente con DNI: ${dni}`
      );
      req.flash("success", `Paciente con DNI ${dni} actualizado con éxito.`);
    } else {
      // Crear un nuevo paciente
      const nuevoPaciente = await Paciente.create({
        nombre,
        apellido,
        dni,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        genero,
        embarazo,
        diagnostico,
        fecha_registro: new Date(),
      });
      console.log("Nuevo paciente guardado con éxito:", dni);

      // Crear un usuario asociado al paciente
      const hashedPassword = await bcrypt.hash(dni, 10); // Hashea el DNI como contraseña por defecto
      await Usuarios.create({
        nombre_usuario: `${nombre} ${apellido}`,
        rol: "paciente",
        correo_electronico: email,
        password: hashedPassword,
      });
      console.log("Usuario creado con éxito:", email);

      // Registro de auditoría
      await auditoriaController.registrar(
        usuarioId,
        "Creación de Paciente",
        `Creación de un nuevo paciente con DNI: ${dni}`
      );
    }

    // Redirigir con el mensaje de éxito
    res.redirect(`/tecnico?success=El paciente se generó o actualizó con éxito.`);
  } catch (error) {
    console.error("Error al guardar el paciente o usuario:", error);
    res
      .status(500)
      .send("Error al guardar el paciente o usuario en la base de datos.");
  }
});


// Eliminar paciente y usuario por DNI
router.post("/eliminar-paciente/:dni", async (req, res) => {
  const { dni } = req.params;

  try {
    // Buscar al paciente por DNI
    const paciente = await Paciente.findOne({ where: { dni } });

    if (!paciente) {
      return res.status(404).send("Paciente no encontrado.");
    }

    // Buscar al usuario por email o cualquier otro campo asociado
    const usuario = await Usuarios.findOne({
      where: { Correo_Electronico: paciente.email },
    });

    // Eliminar el paciente
    await paciente.destroy();
    console.log(`Paciente con DNI ${dni} eliminado.`);

    // Eliminar el usuario asociado si existe
    if (usuario) {
      await usuario.destroy();
      console.log(`Usuario con email ${paciente.email} eliminado.`);
    }

    // Redirigir o enviar respuesta de éxito
    res.redirect("/tecnico"); // Redirigir a la lista de pacientes u otra página adecuada
  } catch (error) {
    console.error("Error al eliminar el paciente o usuario:", error);
    res.status(500).send("Error al eliminar el paciente o usuario.");
  }
});

module.exports = router;
