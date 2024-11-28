const express = require("express");
const multer = require("multer");
const { Op } = require("sequelize");
const crypto = require("crypto");
const path = require("path");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const pacienteRuta = require("./routes/pacienteRuta");
const determinacionesRuta = require("./routes/determinacionesRuta");
const examenRuta = require("./routes/examenRuta");
const OrdenesTrabajoRuta = require("./routes/ordenes_trabajoRuta");
const valoresRefRuta = require("./routes/valoresRefRuta");
const modificarExamenRuta = require("./routes/modificarExamenRuta");
const modificarDeterminacionRuta = require("./routes/modificarDeterminacionRuta");
const buscarOrdenesRuta = require("./routes/buscarOrdenesRuta");
const modificarValrefRuta = require("./routes/modificarValrefRuta");
const auditoriaController = require("./routes/AuditoriaRuta");
const muestrasRouter = require("./routes/resultadosRuta");
const flash = require("connect-flash");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/uploads")); // Carpeta de destino
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString("hex");
    cb(null, `${uniqueName}${path.extname(file.originalname)}`); // Nombre único con extensión original
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño: 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)."));
  },
});
// Middleware para servir archivos estáticos desde la carpeta '/public'
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path, stat) => {
      res.set("Content-Type", "text/css"); // Configura el tipo de contenido para archivos CSS
    },
  })
);

// Middleware para body parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// Configuración de express-session (habilita sesiones)
app.use(
  session({
    secret: "corva",
    resave: false,
    saveUninitialized: true,
  })
);

// Inicialización de Passport y sesión después de la configuración de sesión
app.use(passport.initialize());
app.use(passport.session());

// Configuración de la estrategia local de Passport.js
passport.use(
  new LocalStrategy(
    {
      usernameField: "correo_electronico",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        if (!username || !password) {
          return done(null, false, { message: "Credenciales incorrectas" });
        }

        const user = await User.findOne({
          where: { correo_electronico: username },
        });

        if (!user) {
          return done(null, false, { message: "Credenciales incorrectas" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Credenciales incorrectas" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Error de autenticación:", error);
        return done(error);
      }
    }
  )
);

// Serialización y deserialización de usuarios con Passport.js
passport.serializeUser((user, done) => {
  done(null, user.id_Usuario);
});

passport.deserializeUser(async (id_Usuario, done) => {
  try {
    const user = await User.findByPk(id_Usuario, {
      attributes: ["id_Usuario", "correo_electronico", "rol", "nombre_usuario", "urlFoto", "password"], // Incluye correo electrónico
      
    });
    if (!user) {
      done(null, false);
    } else {
      done(null, user);
    }
  } catch (error) {
    done(error);
  }
});
app.use((req, res, next) => {
  res.locals.query = req.query;
  if (req.isAuthenticated()) {
    res.locals.rol = req.user.rol; // Agrega el rol a las vistas
    res.locals.nombreUsuario = req.user.nombre_usuario;
    res.locals.urlFoto = req.user.urlFoto || "/public/img/default-avatar.png"; // Foto del usuario o predeterminada
    // Nombre del usuario
  }else{
    res.locals.rol = "";
    res.locals.nombreUsuario = ""; // Nombre del usuario
  }
  next();
});

// Middleware para verificar roles
function checkRole(roles) {
  return (req, res, next) => {
    if (
      req.isAuthenticated() &&
      (roles.includes(req.user.rol) || req.user.rol === "admin")
    ) {
      next(); // Si el usuario tiene el rol adecuado o es un admin, permite el acceso
    } else {
      res.status(403).send("Acceso no autorizado");
    }
  };
}




// Configurar flash messages
app.use(flash());

// Middleware para pasar los mensajes flash a las vistas
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  next();
});

// Rutas protegidas por roles
app.use("/",pacienteRuta);
app.use("/buscarOrdenes", checkRole(["tecnico", "bioquimico", "admin", "recepcionista"]),buscarOrdenesRuta);
app.use("/",OrdenesTrabajoRuta);

app.use("/orden", checkRole(["tecnico", "bioquimico", "admin", "recepcionista"]),OrdenesTrabajoRuta);
app.use("/examen", checkRole(["tecnico", "bioquimico", "admin"]), examenRuta);
app.use(
  "/determinacion",
  checkRole(["tecnico", "bioquimico", "admin"]),
  determinacionesRuta
);
app.use(
  "/valoresreferencia",
  checkRole(["tecnico", "bioquimico", "admin"]),
  valoresRefRuta
);
app.use(
  "/modificar-examen",
  checkRole(["tecnico", "bioquimico", "admin"]),
  modificarExamenRuta
);

app.use(
  "/buscar-valores",
  checkRole(["tecnico", "bioquimico", "admin"]),
  modificarValrefRuta
);
app.use(
  "/buscar-valores",
  checkRole(["tecnico", "bioquimico", "admin"]),
  modificarDeterminacionRuta
);
app.use("/muestras", checkRole(["tecnico", "bioquimico", "admin", "recepcionista"]),muestrasRouter);

// Ruta de inicio de sesión
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    // Si ya está autenticado, redirige a la ruta correspondiente según su rol
    return res.redirect('/redirigirUsuario');
  } else {
    // Si no está autenticado, muestra la vista de login
    res.render('login');
  }
});

// Ruta principal
app.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    // Si no está autenticado, redirige a la página de login
    return res.redirect('/login');
  }
  // Si está autenticado, redirige a su vista correspondiente
  return res.redirect('/redirigirUsuario');
});

// Ruta POST para el inicio de sesión con Passport.js
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: true }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const errorMessage = 'Email o contraseña incorrectos. Intente nuevamente.';
      return res.render('login', { message: errorMessage });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const token = jwt.sign(
        { id: user.id_Usuario, rol: user.rol },
        'messicrack'
      );
      switch (user.rol) {
        case 'recepcionista':
          return res.redirect('/recepcionista');
        case 'tecnico':
          return res.redirect('/tecnico');
        case 'bioquimico':
          return res.redirect('/bioquimico');
        case 'admin':
          return res.redirect('/admin');
          case 'paciente':
            return res.redirect('/portalPaciente')
        default:
          return res.status(403).send('Acceso no autorizado');
      }
    });
  })(req, res, next);
});

// Ruta GET para redirigir al usuario según su rol después del inicio de sesión
app.get('/redirigirUsuario', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
  }

  switch (req.user.rol) {
    case 'recepcionista':
      return res.redirect('/recepcionista');
    case 'tecnico':
      return res.redirect('/tecnico');
    case 'bioquimico':
      return res.redirect('/bioquimico');
    case 'admin':
      return res.redirect('/admin');
    default:
      return res.status(403).send('Acceso no autorizado');
  }
});


// Ruta GET para la vista de recepcionista
app.get("/recepcionista", (req, res) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "recepcionista" ||
      req.user.rol === "tecnico" ||
      req.user.rol === "bioquimico" ||
      req.user.rol === "admin")
  ) {
    res.render("recepcionista", { nombreUsuario: req.user.nombre_usuario });
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});

// Ruta GET para la vista de técnico
app.get("/tecnico", (req, res) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "tecnico" ||
      req.user.rol === "bioquimico" ||
      req.user.rol === "admin")
  ) {
    res.render("tecnico", { nombreUsuario: req.user.nombre_usuario });
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});

// Ruta GET para la vista de bioquímico
app.get("/bioquimico", (req, res) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "bioquimico" || req.user.rol === "admin")
  ) {
    res.render("bioquimico", { nombreUsuario: req.user.nombre_usuario });
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});

// Ruta GET para la vista de administrador
app.get("/admin", (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    res.render("admin", { nombreUsuario: req.user.nombre_usuario });
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});
app.get("/portalPaciente", (req, res) => {
  if (
    req.isAuthenticated() &&
    (req.user.rol === "paciente" || req.user.rol === "admin")
  ) {
    res.render("portalPaciente", { nombreUsuario: req.user.nombre_usuario });
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});

// Ruta GET para la vista de creación de usuario para administrador
app.get("/admin/crear-usuario", (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    res.render("crear-usuario");
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});
// Ruta GET para la vista de auditoria
app.get("/admin/auditoria", async (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    const { descripcion, usuario, fecha, page = 1 } = req.query;
    const limit = 15;
    const offset = (page - 1) * limit;

    try {
      const filtros = { descripcion, usuario, fecha, limit, offset };
      const { auditorias, totalPages } = await auditoriaController.listarAuditorias(filtros);

      if (req.xhr || req.headers.accept.includes('json')) {
        return res.json({ auditorias, totalPages });
      }

      res.render("auditoria", {
        auditorias,
        totalPages,
        currentPage: parseInt(page),
        descripcion,
        usuario,
        fecha,
      });
    } catch (error) {
      console.error("Error al obtener auditorías:", error);
      res.status(500).send("Error al obtener auditorías");
    }
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});



// Ruta para la búsqueda dinámica por descripción
// app.get("/admin/auditoria/buscar", async (req, res) => {
//   if (req.isAuthenticated() && req.user.rol === "admin") {
//     const { descripcion } = req.query;
//     try {
//       // Si la descripción está vacía, retorna todas las auditorías
//       if (!descripcion || descripcion.trim() === "") {
//         const auditorias = await auditoriaController.listarAuditorias({
//           limit: 1000,
//           offset: 0,
//         }); // Ajusta el límite según tus necesidades
//         return res.json(auditorias.auditorias); // No incluye la paginación
//       }

//       // Busca auditorías por descripción
//       const auditorias = await auditoriaController.buscarPorDescripcion(
//         descripcion
//       );
//       res.json(auditorias);
//     } catch (error) {
//       res.status(500).send("Error al obtener auditorías");
//     }
//   } else {
//     res.status(403).send("Acceso no autorizado");
//   }
// });
// Ruta GET para la vista de actualización de usuario para administrador
app.get("/admin/actualizarUsuarioAdm", async (req, res) => {

  if (req.isAuthenticated() && req.user.rol === "admin") {
    const { nombre } = req.query;

    try {
      if (nombre) {
        // Si el parámetro `nombre` está presente, realiza la búsqueda
        const usuarios = await User.findAll({
          where: {
            [Op.or]: [
              { nombre_usuario: { [Op.like]: `%${nombre}%` } },
              { correo_electronico: { [Op.like]: `%${nombre}%` } },
            ],
          },
          attributes: ["id_Usuario", "nombre_usuario", "correo_electronico", "rol", "urlFoto", "password"], // Incluye la URL de la foto
        });

        return res.json({ usuarios }); // Devuelve los resultados como JSON
      }

      // Si no hay parámetro `nombre`, renderiza la vista
      res.render("actualizarUsuarioAdm");
    } catch (error) {
      console.error("Error al manejar la solicitud:", error);

      // Devuelve un error JSON si se estaba buscando o renderiza un error si es la vista
      if (nombre) {
        return res.status(500).json({ error: "Error en la búsqueda" });
      }
      res.status(500).send("Error al renderizar la página");
    }
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});


// Ruta POST para actualizar un usuario por administrador
app.post("/admin/actualizar-usuario", upload.single("foto"), async (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    const { nombre } = req.query;

  try {
    const { idUsuario, nombre, correo_electronico, password, rol } = req.body;
    const foto = req.file;

    // Verifica que el ID del usuario esté presente
    if (!idUsuario) {
      return res.render("actualizarUsuarioAdm", {
        mensajeError: "No se pudo actualizar el usuario. ID no proporcionado.",
      });
    }

    // Busca el usuario por ID
    const usuarioExistente = await User.findByPk(idUsuario);
    if (!usuarioExistente) {
      return res.render("actualizarUsuarioAdm", { mensajeError: "Usuario no encontrado." });
    }

    // Actualiza los datos del usuario
    usuarioExistente.nombre_usuario = nombre;
    usuarioExistente.correo_electronico = correo_electronico;
    if (password) usuarioExistente.password = bcrypt.hashSync(password, 10);
    usuarioExistente.rol = rol;

    // Maneja la foto
    if (foto) {
      usuarioExistente.urlFoto = `/public/uploads/${foto.filename}`;
    }

    await usuarioExistente.save();

    res.render("actualizarUsuarioAdm", {
      mensajeExito: `Usuario ${nombre} actualizado exitosamente.`,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.render("actualizarUsuarioAdm", {
      mensajeError: "Ocurrió un error al actualizar el usuario.",
    });
  }
}});


// Ruta DELETE para eliminar un usuario por administrador
app.delete("/admin/eliminarUsuarioAdm/:id", async (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    const { nombre } = req.query;

  const idUsuario = req.params.id;

  try {
    const usuario = await User.findByPk(idUsuario);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await usuario.destroy();
    res.status(200).json({ mensaje: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error en el servidor: ", error);
    res.status(500).json({ error: "Error en el servidor" });
  }}
});

// Ruta POST para crear un usuario por administrador
app.post("/admin/crear-usuario", upload.single("foto"), async (req, res) => {
  if (req.isAuthenticated() && req.user.rol === "admin") {
    const { nombre, correo_electronico, password, rol } = req.body;
    const foto =req.file;
    const urlFoto = foto ? `/public/uploads/${foto.filename}` : null;
    try {
      const existingUser = await User.findOne({
        where: { correo_electronico },
      });

      if (existingUser) {
        // Si el usuario ya existe, muestra un mensaje en la vista Pug
        res.render("crear-usuario", {
          mensaje: null,
          error: "El correo electrónico ya está en uso. Ingrese otro.",
        });
      } else {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await User.create({
          nombre_usuario: nombre, // Asegúrate de usar el nombre de columna correcto
          correo_electronico,
          password: hashedPassword,
          rol,
          urlFoto,

        });
        // Establece el mensaje y redirige a la misma página para mostrarlo
        res.render("crear-usuario", {
          mensaje: "Usuario creado exitosamente",
          error: null,
        });
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).send("Error al crear el usuario");
    }
  } else {
    res.status(403).send("Acceso no autorizado");
  }
});

// Ruta GET para la vista de muestras
app.get("/muestras", async (req, res) => {
  
  try {
    // Renderiza la vista 'muestras.pug'
    res.render("muestras");
  } catch (error) {
    console.error("Error al renderizar la vista de muestras:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta GET para cerrar sesión
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.redirect("/"); // Redirige al usuario a la página de inicio o a otra página deseada
  });
});

// Ruta GET para cargar la vista de cambio de contraseña
app.get("/cambiarContrasena", (req, res) => {
  res.render("cambiarContrasena", {
    mensajeContrasenaIncorrecta: false,
    mensajeContrasenasNoCoinciden: false,
  });
});

// Ruta POST para procesar el cambio de contraseña
app.post("/cambiar-contrasena", (req, res) => {
  const usuario = req.user; // Obtén el usuario autenticado

  const contrasenaActual = req.body.contrasena_actual;
  const nuevaContrasena = req.body.nueva_contrasena;
  const confirmarContrasena = req.body.confirmar_contrasena;

  // Verificar si la contraseña actual ingresada coincide con la del usuario
  if (!bcrypt.compareSync(contrasenaActual, usuario.password)) {
    return res.render("cambiarContrasena", {
      mensajeContrasenaIncorrecta: true,
      mensajeContrasenasNoCoinciden: false,
    });
  }

  // Verificar si las contraseñas nuevas coinciden
  if (nuevaContrasena !== confirmarContrasena) {
    // Las contraseñas nuevas no coinciden, muestra un mensaje de error

    return res.render("cambiarContrasena", {
      mensajeContrasenaIncorrecta: false,
      mensajeContrasenasNoCoinciden: true,
    });
  }

  // Cifrar la nueva contraseña y actualizarla en la base de datos
  const hashedPassword = bcrypt.hashSync(nuevaContrasena, 10);
  usuario.password = hashedPassword;
  usuario.save();

  // Redirige al usuario a la página de inicio o a donde desees y muestra el mensaje de contraseña cambiada
  res.render("cambiarContrasena", {
    message: "Contraseña cambiada exitosamente.",
    contrasenaCambiada: true,
  });
});
// Sincronización de modelos con la base de datos y arranque del servidor en el puerto 3000
sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
    });
  })
  .catch((error) => {
  });

