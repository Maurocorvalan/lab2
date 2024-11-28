const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const sequelize = require("../config/database"); // Asegúrate de que sea tu configuración Sequelize
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OrdenTrabajo = require("../models/ordenes_trabajo");
const Muestra = require("../models/muestra");
const Examen = require("../models/examen");
const Paciente = require("../models/paciente");
const OrdenesExamenes = require("../models/ordenes_examen");
const auditoriaController = require("../routes/AuditoriaRuta");
const TiposMuestra = require("../models/tipos_muestra");
const Determinaciones = require("../models/determinacion");
const Resultado = require("../models/resultados");
const valoresReferencia = require("../models/valoresReferencia");
// Función para sumar días a una fecha
function sumarDias(fecha, dias) {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
async function obtenerIdTipoMuestra(nombreTipoMuestra) {
  try {
    const tipoMuestra = await TiposMuestra.findOne({
      where: { tipoDeMuestra: nombreTipoMuestra },
    });
    return tipoMuestra ? tipoMuestra.idTipoMuestra : null;
  } catch (error) {
    console.error(
      `Error al obtener ID para tipo de muestra "${nombreTipoMuestra}":`,
      error
    );
    return null;
  }
}
router.get("/ordenes", (req, res) => {
  res.render("buscarPacientesOrdenes");
});

router.get("/ordenesAnalitica", async (req, res) => {
  try {
    const { page = 1 } = req.query; // Página solicitada, por defecto 1
    const limit = 10; // Número de elementos por página
    const offset = (page - 1) * limit;

    // Obtener órdenes de trabajo con los datos del paciente
    const { rows: ordenes, count: totalOrdenes } =
      await OrdenTrabajo.findAndCountAll({
        limit,
        offset,
        include: {
          model: Paciente,
          attributes: ["nombre", "apellido"], // Incluir datos específicos del paciente
          required: false, // Permite que órdenes sin paciente sean incluidas
        },
        order: [["Fecha_Creacion", "DESC"]],
      });

    // Total de páginas
    const totalPages = Math.ceil(totalOrdenes / limit);
    // Renderizar la vista con los datos originales
    res.render("muestrasOrden", {
      ordenes, // Pasar el objeto completo tal como está
      currentPage: parseInt(page, 10),
      totalPages,
    });
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error);
    res.status(500).send("Error al cargar las órdenes de trabajo.");
  }
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
      tipos_muestra, // Este es un array con los tipos de muestra seleccionados
      ...rest
    } = req.body;

    const user = req.user;

    console.log("Datos recibidos:", req.body);

    // Verificar autenticación
    if (!user || !user.dataValues) {
      return res.status(401).send("Usuario no autenticado.");
    }
    const usuarioId = user.dataValues.id_Usuario;

    // Validar datos obligatorios
    if (!id_paciente || !dni_paciente || !estado || !examenesSelectedIds) {
      return res
        .status(400)
        .send("Todos los campos requeridos deben ser completados.");
    }

    const examenesSelectedIdsArray = examenesSelectedIds
      .split(",")
      .map((id) => parseInt(id))
      .filter(Boolean);

    if (examenesSelectedIdsArray.length === 0) {
      return res
        .status(400)
        .send("Debe seleccionar al menos un examen válido.");
    }

    // Calcular fecha de entrega
    const tiempoMaximoDemora = await Examen.max("tiempoDemora", {
      where: { id_examen: examenesSelectedIdsArray },
    });

    if (!tiempoMaximoDemora) {
      return res.status(400).send("No se pudo calcular el tiempo de demora.");
    }

    const fechaEntrega = sumarDias(new Date(), tiempoMaximoDemora);

    // Crear la orden de trabajo
    const nuevaOrden = await OrdenTrabajo.create({
      id_Paciente: id_paciente,
      estado,
      dni: dni_paciente,
      Fecha_Creacion: new Date(),
      Fecha_Entrega: fechaEntrega,
    });

    console.log(`Orden creada con ID: ${nuevaOrden.id_Orden}`);

    // Asociar exámenes a la orden
    for (const examenId of examenesSelectedIdsArray) {
      await OrdenesExamenes.create({
        id_Orden: nuevaOrden.id_Orden,
        id_examen: examenId,
      });
    }

    // Manejar tipos de muestra y sus estados
    if (tipos_muestra) {
      const tiposMuestraArray = Array.isArray(tipos_muestra)
        ? tipos_muestra
        : [tipos_muestra];

      for (const tipoMuestra of tiposMuestraArray) {
        const idTipoMuestra = await obtenerIdTipoMuestra(tipoMuestra.trim());
        if (!idTipoMuestra) continue;

        const estadoMuestraKey = `estado_muestra_${tipoMuestra.trim()}`;
        const estadoMuestra = rest[estadoMuestraKey];

        if (!estadoMuestra) {
          return res
            .status(400)
            .send(
              `Debe seleccionar un estado para el tipo de muestra: ${tipoMuestra}`
            );
        }

        await Muestra.create({
          id_Orden: nuevaOrden.id_Orden,
          id_Paciente: id_paciente,
          idTipoMuestra,
          Fecha_Recepcion: new Date(),
          estado: estadoMuestra,
        });
      }
    } else {
      console.warn("No se seleccionaron tipos de muestra.");
    }

    // Registrar auditoría
    await auditoriaController.registrar(
      usuarioId,
      "Generación de Orden de Trabajo",
      `Generación de una nueva orden con ID: ${nuevaOrden.id_Orden}`
    );

    res.redirect(`/tecnico?success=Orden generada con éxito.`);
  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    res.status(500).send("Error al procesar el formulario.");
  }
});

// Endpoint para ver las muestras de una orden
router.get("/muestras/ver/:id_Orden", async (req, res) => {
  const { id_Orden } = req.params;

  try {
    // Buscar muestras asociadas a la orden de trabajo
    const muestras = await Muestra.findAll({
      where: { id_Orden },
      include: [
        {
          model: TiposMuestra,
          as: "TipoMuestra",
          attributes: ["tipoDeMuestra"], // Solo traer el tipo de muestra
        },
      ],
    });
    // Verificar si hay muestras asociadas
    if (!muestras || muestras.length === 0) {
      return res.status(404).render("no-muestras", { id_Orden });
    }

    // Renderizar la vista con las muestras obtenidas
    res.render("ver-muestras", { muestras, id_Orden });
  } catch (error) {
    console.error("Error al obtener las muestras:", error);
    res.status(500).send("Ocurrió un error al obtener las muestras.");
  }
});

// Endpoint para actualizar el estado de todas las muestras de una orden a Pre-Informe
router.post("/muestras/preinformar/:id_Orden", async (req, res) => {
  const { id_Orden } = req.params;
  const usuarioId = req.user.dataValues.id_Usuario;

  try {
    // Verificar si ya están en estado Pre-Informe
    const muestrasPendientes = await Muestra.count({
      where: {
        id_Orden,
        estado: { [Op.ne]: "Pre-Informe" }, // Contar muestras que no están en Pre-Informe
      },
    });

    if (muestrasPendientes === 0) {
      // Todas las muestras ya están en Pre-Informe
      return res.render("ver-muestras", {
        muestras: await Muestra.findAll({
          where: { id_Orden },
          include: [
            {
              model: TiposMuestra,
              as: "TipoMuestra",
              attributes: ["tipoDeMuestra"],
            },
          ],
        }),
        id_Orden,
        success: null,
        error: "Todas las muestras ya están en estado Pre-Informe.",
      });
    }

    // Actualizar muestras pendientes a estado Pre-Informe
    const [updatedRows] = await Muestra.update(
      { estado: "Pre-Informe" },
      { where: { id_Orden, estado: { [Op.ne]: "Pre-Informe" } } }
    );

    if (updatedRows > 0) {
      // Registrar auditoría para la actualización
      await auditoriaController.registrar(
        usuarioId,
        "Actualizar Muestras a Pre-Informe",
        `Se actualizaron ${updatedRows} muestras de la orden ${id_Orden} a estado Pre-Informe.`
      );

      // Redirigir a la vista con un mensaje de éxito
      return res.render("ver-muestras", {
        muestras: await Muestra.findAll({
          where: { id_Orden },
          include: [
            {
              model: TiposMuestra,
              as: "TipoMuestra",
              attributes: ["tipoDeMuestra"],
            },
          ],
        }),
        id_Orden,
        success: "Muestras actualizadas con éxito.",
        error: null,
      });
    }

    // Si no se actualizaron filas (fallo inesperado)
    return res.render("ver-muestras", {
      muestras: await Muestra.findAll({
        where: { id_Orden },
        include: [
          {
            model: TiposMuestra,
            as: "TipoMuestra",
            attributes: ["tipoDeMuestra"],
          },
        ],
      }),
      id_Orden,
      success: null,
      error: "No se pudieron actualizar las muestras.",
    });
  } catch (error) {
    console.error("Error al actualizar el estado de las muestras:", error);
    res
      .status(500)
      .send("Ocurrió un error al actualizar el estado de las muestras.");
  }
});

// Endpoint para obtener datos de "Pre Informe"
// Ruta para renderizar la vista "registrarResultados"
router.get("/registrarResultados/:id_Orden", async (req, res) => {
  const idOrden = req.params.id_Orden;
  const modificar = req.query.modificar === "true";

  // Detectar si viene desde el botón "Modificar Resultados"

  try {
    // Consulta con LEFT JOIN para incluir los resultados
    const resultados = await sequelize.query(
      `
      SELECT 
          ot.id_Orden AS OrdenID,
          ot.Fecha_Creacion AS FechaCreacion,
          ot.Fecha_Entrega AS FechaEntrega,
          p.id_Paciente AS PacienteID,
          p.Nombre AS NombrePaciente,
          p.Apellido AS ApellidoPaciente,
          p.Fecha_Nacimiento AS FechaNacimiento,
          p.genero AS SexoPaciente,
          TIMESTAMPDIFF(YEAR, p.Fecha_Nacimiento, CURDATE()) AS EdadPaciente,
          e.id_examen AS ExamenID,
          e.nombre_examen AS NombreExamen,
          e.descripcion AS DescripcionExamen,
          d.id_Determinacion AS DeterminacionID,
          d.Nombre_Determinacion AS NombreDeterminacion,
          um.nombreUnidadMedida AS UnidadMedidaDeterminacion,
          vr.id_ValorReferencia AS ValorReferenciaID,
          vr.Valor_Referencia_Minimo AS ValorReferenciaMinimo,
          vr.Valor_Referencia_Maximo AS ValorReferenciaMaximo,
          vr.Sexo AS SexoValorReferencia,
          vr.Edad_Minima AS EdadMinimaValorReferencia,
          vr.Edad_Maxima AS EdadMaximaValorReferencia,
          r.Valor AS ResultadoValor -- Resultado existente si lo hay
      FROM 
          ordenes_trabajo ot
      JOIN 
          ordenes_examenes oe ON ot.id_Orden = oe.id_Orden
      JOIN 
          examen e ON oe.id_examen = e.id_examen
      JOIN 
          determinaciones d ON e.id_examen = d.id_Examen
      JOIN 
          pacientes p ON ot.id_Paciente = p.id_Paciente
      JOIN 
          valoresreferencia vr ON d.id_Determinacion = vr.id_Determinacion 
          AND vr.Sexo = CASE 
                            WHEN p.genero = 'masculino' THEN 'M'
                            WHEN p.genero = 'femenino' THEN 'F'
                        END
          AND TIMESTAMPDIFF(YEAR, p.Fecha_Nacimiento, CURDATE()) BETWEEN vr.Edad_Minima AND vr.Edad_Maxima
          AND vr.estado = 1
      JOIN 
          unidadmedida um ON d.Unidad_Medida = um.id_UnidadMedida
      LEFT JOIN 
          resultados r ON r.id_Orden = ot.id_Orden AND r.id_Determinacion = d.id_Determinacion
      WHERE 
          ot.id_Orden = :idOrden;
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Renderizar la vista con los resultados obtenidos
    res.render("registrarResultados", { orden: resultados, modificar });
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).send("Hubo un problema al cargar los resultados.");
  }
});

router.post("/registrarResultados", async (req, res) => {
  const { idOrden, ...campos } = req.body;
  const user = req.user;
  const usuarioId = req.user.dataValues.id_Usuario;

  const rol = res.locals.rol;

  let transaction;

  try {
    // Iniciar transacción
    transaction = await sequelize.transaction();

    // Iterar sobre los campos enviados desde el formulario
    for (const key in campos) {
      if (key.startsWith("resultado_")) {
        const idDeterminacion = key.split("_")[1]; // Extraer el ID de la determinación
        const valor = campos[key]; // Valor ingresado para esta determinación
        const unidad = campos[`unidad_${idDeterminacion}`]; // Unidad asociada a esta determinación

        // Verificar si ya existe un resultado para esta orden y determinación
        const [resultadoExistente] = await sequelize.query(
          `
          SELECT id_Resultado
          FROM resultados
          WHERE id_Orden = :idOrden AND id_Determinacion = :idDeterminacion
          `,
          {
            replacements: { idOrden, idDeterminacion },
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        if (resultadoExistente) {
          // Actualizar el resultado existente
          await sequelize.query(
            `
            UPDATE resultados
            SET Valor = :valor, Unidad = :unidad, Estado = 'Para Validar'
            WHERE id_Resultado = :idResultado
            `,
            {
              replacements: {
                valor: Array.isArray(valor) ? valor[0] : valor, // Asegura que el valor no sea un array
                unidad: Array.isArray(unidad) ? unidad[0] : unidad, // Asegura que la unidad no sea un array
                idResultado: resultadoExistente.id_Resultado,
              },
              type: sequelize.QueryTypes.UPDATE,
              transaction,
            }
          );
          await auditoriaController.registrar(
            user.idUsuario,
            "Actualizar Resultado",
            `Resultado actualizado para la determinación ${idDeterminacion} de la orden ${idOrden}`
          );
        } else {
          // Crear un nuevo resultado
          await sequelize.query(
            `
            INSERT INTO resultados (id_Orden, id_Determinacion, Valor, Unidad, Estado)
            VALUES (:idOrden, :idDeterminacion, :valor, :unidad, 'Para Validar')
            `,
            {
              replacements: {
                idOrden,
                idDeterminacion,
                valor: Array.isArray(valor) ? valor[0] : valor, // Asegura que el valor no sea un array
                unidad: Array.isArray(unidad) ? unidad[0] : unidad, // Asegura que la unidad no sea un array
              },
              type: sequelize.QueryTypes.INSERT,
              transaction,
            }
          );
          await auditoriaController.registrar(
            user.idUsuario,
            "Crear Resultado",
            `Nuevo resultado creado para la determinación ${idDeterminacion} de la orden ${idOrden}`
          );
        }
      }
    }

    // Actualizar el estado de la orden a "Para Validar"
    await sequelize.query(
      `
      UPDATE ordenes_trabajo
      SET estado = 'Para Validar'
      WHERE id_Orden = :idOrden
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );
    // Registrar auditoría para el cambio de estado de la orden
    await auditoriaController.registrar(
      user.idUsuario,
      "Actualizar Estado de Orden",
      `Estado de la orden ${idOrden} actualizado a 'Para Validar'`
    );
    // Confirmar transacción
    await transaction.commit();

    // Redirigir al usuario o enviar una respuesta
    res.render(`/${rol}`, { success: "Resultados guardados" });
  } catch (error) {
    console.error("Error al guardar los resultados:", error);

    // Revertir transacción si hay un error
    if (transaction) await transaction.rollback();

    res
      .status(500)
      .send("Error al guardar los resultados. Por favor, intenta nuevamente.");
  }
});

//imprimir muestra
router.get("/muestras/imprimir/:id_Muestra", async (req, res) => {
  const { id_Muestra } = req.params;

  try {
    // Verificar que la carpeta `temp` exista; si no, crearla
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Buscar la muestra y los datos del paciente asociados
    const muestra = await Muestra.findOne({
      where: { id_Muestra },
      include: [
        {
          model: TiposMuestra,
          as: "TipoMuestra",
          attributes: ["tipoDeMuestra"],
        },
        {
          model: Paciente,
          as: "Paciente",
          attributes: ["nombre", "apellido", "dni"],
        },
      ],
    });

    if (!muestra) {
      return res.status(404).send("Muestra no encontrada.");
    }

    // Crear el nombre del archivo PDF con ID de orden y nombre del paciente
    const filePath = path.join(
      tempDir,
      `etiqueta-orden-${
        muestra.id_Orden
      }-paciente-${muestra.Paciente.nombre.replace(
        /\s+/g,
        "_"
      )}-${muestra.Paciente.apellido.replace(/\s+/g, "_")}.pdf`
    );

    // Crear el PDF
    const doc = new PDFDocument({
      size: [113.4, 56.7], // 4cm x 2cm en puntos
      margins: { top: 5, left: 5, bottom: 5, right: 5 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Configuración del texto para que quepa en una sola página
    const fontSize = 4.5; // Tamaño de fuente reducido
    const lineHeight = fontSize + 2; // Espacio entre líneas
    let y = 5; // Posición inicial en el eje Y

    doc.fontSize(fontSize);
    doc.text(`Nº de Orden: ${muestra.id_Orden}`, 5, y);
    y += lineHeight;
    doc.text(`Código Persona: ${muestra.id_Paciente}`, 5, y);
    y += lineHeight;
    doc.text(
      `Paciente: ${muestra.Paciente.nombre} ${muestra.Paciente.apellido}`,
      5,
      y
    );
    y += lineHeight;
    doc.text(`Documento: ${muestra.Paciente.dni}`, 5, y);
    y += lineHeight;
    doc.text(`Tipo de Muestra: ${muestra.TipoMuestra.tipoDeMuestra}`, 5, y);
    y += lineHeight;
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 5, y);
    y += lineHeight;
    doc.text(`Hora: ${new Date().toLocaleTimeString()}`, 5, y);

    // Finalizar el documento
    doc.end();

    // Esperar a que el PDF esté listo antes de enviarlo
    stream.on("finish", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=etiqueta-${id_Muestra}.pdf`
      );
      fs.createReadStream(filePath).pipe(res);
    });

    stream.on("error", (error) => {
      console.error("Error al escribir el archivo:", error);
      res.status(500).send("Ocurrió un error al generar la etiqueta.");
    });
  } catch (error) {
    console.error("Error al generar la etiqueta:", error);
    res.status(500).send("Ocurrió un error al generar la etiqueta.");
  }
});

router.get("/pendientesAValidar", async (req, res) => {
  try {
    const { page = 1 } = req.query; // Página solicitada, por defecto 1
    const limit = 10; // Número de elementos por página
    const offset = (page - 1) * limit;

    // Obtener órdenes pendientes a validar
    const { rows: ordenes, count: totalOrdenes } =
      await OrdenTrabajo.findAndCountAll({
        limit,
        offset,
        where: { estado: "Para Validar" }, // Filtro para estado
        include: {
          model: Paciente,
          attributes: ["nombre", "apellido"], // Incluir datos específicos del paciente
          required: false, // Permite que órdenes sin paciente sean incluidas
        },
        order: [["Fecha_Creacion", "DESC"]],
      });

    // Total de páginas
    const totalPages = Math.ceil(totalOrdenes / limit);

    // Renderizar la vista con los datos originales
    res.render("pendientesAValidar", {
      ordenes,
      currentPage: parseInt(page, 10),
      totalPages,
    });
  } catch (error) {
    console.error("Error al obtener órdenes pendientes a validar:", error);
    res.status(500).send("Error al cargar las órdenes pendientes a validar.");
  }
});

router.get("/validarResultados/:id_Orden", async (req, res) => {
  const idOrden = req.params.id_Orden;

  try {
    // Ejecutar la consulta
    const resultados = await sequelize.query(
      `
      SELECT 
          ot.id_Orden AS OrdenID,
          ot.Fecha_Creacion AS FechaCreacion,
          ot.Fecha_Entrega AS FechaEntrega,
          p.id_Paciente AS PacienteID,
          p.Nombre AS NombrePaciente,
          p.Apellido AS ApellidoPaciente,
          p.Fecha_Nacimiento AS FechaNacimiento,
          p.genero AS SexoPaciente,
          TIMESTAMPDIFF(YEAR, p.Fecha_Nacimiento, CURDATE()) AS EdadPaciente,
          e.id_examen AS ExamenID,
          e.nombre_examen AS NombreExamen,
          e.descripcion AS DescripcionExamen,
          d.id_Determinacion AS DeterminacionID,
          d.Nombre_Determinacion AS NombreDeterminacion,
          um.nombreUnidadMedida AS UnidadMedidaDeterminacion,
          vr.id_ValorReferencia AS ValorReferenciaID,
          vr.Valor_Referencia_Minimo AS ValorReferenciaMinimo,
          vr.Valor_Referencia_Maximo AS ValorReferenciaMaximo,
          vr.Sexo AS SexoValorReferencia,
          vr.Edad_Minima AS EdadMinimaValorReferencia,
          vr.Edad_Maxima AS EdadMaximaValorReferencia,
          r.Valor AS ResultadoValor
      FROM 
          ordenes_trabajo ot
      JOIN 
          ordenes_examenes oe ON ot.id_Orden = oe.id_Orden
      JOIN 
          examen e ON oe.id_examen = e.id_examen
      JOIN 
          determinaciones d ON e.id_examen = d.id_Examen
      JOIN 
          pacientes p ON ot.id_Paciente = p.id_Paciente
      JOIN 
          valoresreferencia vr ON d.id_Determinacion = vr.id_Determinacion 
          AND vr.Sexo = CASE 
                            WHEN p.genero = 'masculino' THEN 'M'
                            WHEN p.genero = 'femenino' THEN 'F'
                        END
          AND TIMESTAMPDIFF(YEAR, p.Fecha_Nacimiento, CURDATE()) BETWEEN vr.Edad_Minima AND vr.Edad_Maxima
          AND vr.estado = 1
      JOIN 
          unidadmedida um ON d.Unidad_Medida = um.id_UnidadMedida
      LEFT JOIN 
          resultados r ON r.id_Orden = ot.id_Orden AND r.id_Determinacion = d.id_Determinacion
      WHERE 
          ot.id_Orden = :idOrden;
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Renderizar la vista con los resultados
    res.render("validarResultados", { orden: resultados });
  } catch (error) {
    console.error("Error ejecutando la consulta:", error);
    res.status(500).send("Hubo un problema al cargar los resultados.");
  }
});

router.post("/confirmarValidacion", async (req, res) => {
  const { idOrden } = req.body;

  let transaction;

  try {
    // Iniciar una transacción
    transaction = await sequelize.transaction();

    // Actualizar estado de resultados
    await sequelize.query(
      `
      UPDATE resultados
      SET Estado = 'Informada'
      WHERE id_Orden = :idOrden
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );

    // Actualizar estado de la orden
    await sequelize.query(
      `
      UPDATE ordenes_trabajo
      SET estado = 'Informada'
      WHERE id_Orden = :idOrden
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );

    // Actualizar estado de las muestras asociadas
    await sequelize.query(
      `
      UPDATE muestra
      SET estado = 'Informada'
      WHERE id_Orden = :idOrden
      `,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );

    // Confirmar la transacción
    await transaction.commit();

    // Enviar respuesta al cliente
    res
      .status(200)
      .send("Validación confirmada y estados actualizados correctamente.");
  } catch (error) {
    console.error("Error al confirmar validación:", error);

    // Revertir la transacción en caso de error
    if (transaction) await transaction.rollback();

    res
      .status(500)
      .send("Error al confirmar la validación. Por favor, intenta nuevamente.");
  }
});

router.get("/ordenesInformadas", async (req, res) => {
  try {
    // Consultar las órdenes con estado "Informada"
    const ordenesInformadas = await sequelize.query(
      `
      SELECT 
          ot.id_Orden AS OrdenID,
          ot.Fecha_Creacion AS FechaCreacion,
          ot.Fecha_Entrega AS FechaEntrega,
          p.Nombre AS NombrePaciente,
          p.Apellido AS ApellidoPaciente,
          p.dni AS DNIPaciente
      FROM 
          ordenes_trabajo ot
      JOIN 
          pacientes p ON ot.id_Paciente = p.id_Paciente
      WHERE 
          ot.estado = 'Informada'
      ORDER BY 
          ot.Fecha_Creacion DESC;
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Formatear las fechas
    const ordenesConFormato = ordenesInformadas.map((orden) => ({
      ...orden,
      FechaCreacion: formatDate(orden.FechaCreacion),
      FechaEntrega: formatDate(orden.FechaEntrega),
    }));

    // Renderizar la vista
    res.render("ordenesInformadas", { ordenes: ordenesConFormato });
  } catch (error) {
    console.error("Error al obtener órdenes informadas:", error);
    res.status(500).send("Hubo un problema al cargar las órdenes informadas.");
  }
});
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};

// Endpoint para generar el PDF
router.get("/generarPDF/:idOrden", async (req, res) => {
  const { idOrden } = req.params;

  try {
    // Ejecutar la consulta para obtener los datos
    const resultados = await sequelize.query(
      `SELECT 
        e.nombre_examen,
        d.Nombre_Determinacion,
        r.Valor AS valor_resultado,
        r.Unidad AS unidad_resultado,
        vr.Valor_Referencia_Minimo,
        vr.Valor_Referencia_Maximo,
        p.nombre AS nombre_paciente,
        p.apellido AS apellido_paciente,
        p.dni AS dni_paciente,
        p.genero AS sexo_paciente,
        o.Fecha_Creacion AS fecha_orden,
        o.Fecha_Creacion AS fecha_ingreso
      FROM 
        resultados r
      INNER JOIN 
        determinaciones d ON r.id_Determinacion = d.id_Determinacion
      INNER JOIN 
        valoresreferencia vr ON d.id_Determinacion = vr.id_Determinacion
      INNER JOIN 
        examen e ON d.id_Examen = e.id_examen
      INNER JOIN 
        ordenes_trabajo o ON r.id_Orden = o.id_Orden
      INNER JOIN 
        pacientes p ON o.id_Paciente = p.id_paciente
      WHERE 
        o.id_Orden = :idOrden
      ORDER BY 
        e.nombre_examen, d.Nombre_Determinacion;`,
      {
        replacements: { idOrden },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Verificar si hay resultados
    if (resultados.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron resultados para esta orden." });
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar encabezados para visualizar el PDF en el navegador
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=Orden_" + idOrden + ".pdf"
    );

    // Enviar el PDF directamente al cliente
    doc.pipe(res);

    // Estilo del encabezado
    const paciente = resultados[0];
    const sexo =
      paciente.sexo_paciente.toLowerCase() === "masculino"
        ? "Masculino"
        : "Femenino";
    const logoPath = path.join(__dirname, "../public/logo_empresa.png"); // Ruta del logo

    // Encabezado con logo y título
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 80 });
    }
    doc.fontSize(16).text("Informe de Resultados de Laboratorio", 150, 60, {
      align: "center",
    });
    doc.moveDown();
    doc.lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

    // Información del paciente
    doc.moveDown(1);
    doc.fontSize(12);
    const datosPaciente = [
      `Paciente: ${paciente.nombre_paciente} ${paciente.apellido_paciente}`,
      `DNI: ${paciente.dni_paciente}`,
      `Sexo: ${sexo}`,
      `Fecha de Ingreso: ${new Date(
        paciente.fecha_ingreso
      ).toLocaleDateString()}`,
      `Fecha de Orden: ${new Date(paciente.fecha_orden).toLocaleDateString()}`,
    ];
    datosPaciente.forEach((texto, index) => {
      doc.text(texto, 50 + (index % 2) * 250, 140 + Math.floor(index / 2) * 15);
    });
    doc.moveDown(2);

    // Agrupar los resultados por examen
    const examenes = resultados.reduce((acc, resultado) => {
      if (!acc[resultado.nombre_examen]) {
        acc[resultado.nombre_examen] = [];
      }
      acc[resultado.nombre_examen].push(resultado);
      return acc;
    }, {});

    // Recorrer cada examen y añadir al PDF
    for (const [nombreExamen, determinaciones] of Object.entries(examenes)) {
      doc
        .fontSize(14)
        .fillColor("#333333")
        .text(nombreExamen, { underline: true });
      doc.moveDown();

      determinaciones.forEach((determinacion) => {
        const columna1 = `Determinación: ${determinacion.Nombre_Determinacion}`;
        const columna2 = `Resultado: ${determinacion.valor_resultado} ${determinacion.unidad_resultado}`;
        const columna3 = `Valores Ref.: ${determinacion.Valor_Referencia_Minimo} - ${determinacion.Valor_Referencia_Maximo}`;

        doc.fontSize(12).text(columna1, 50, doc.y, { continued: true });
        doc.text(` | ${columna2}`, { continued: true });
        doc.text(` | ${columna3}`);
        doc.moveDown();
      });

      doc.moveDown();
    }

    // Pie de página
    doc
      .moveTo(50, doc.page.height - 50)
      .lineTo(550, doc.page.height - 50)
      .stroke();
    doc.text("Firma: _________________________", 50, doc.page.height - 40);
    doc.text("Médico Responsable", 50, doc.page.height - 25);

    // Finalizar y cerrar el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    res.status(500).json({ error: "Error al generar el archivo PDF." });
  }
});

router.get("/portalPaciente", async (req, res) => {
  try {
    const emailPaciente = req.user.correo_electronico;

    // Consulta para obtener las órdenes informadas del paciente asociado al email
    const ordenesInformadas = await sequelize.query(
      `
      SELECT 
          ot.id_Orden AS OrdenID,
          ot.Fecha_Creacion AS FechaCreacion,
          ot.Fecha_Entrega AS FechaEntrega
      FROM 
          ordenes_trabajo ot
      JOIN 
          pacientes p ON ot.id_Paciente = p.id_Paciente
      WHERE 
          ot.estado = 'Informada' AND p.email = :email
      ORDER BY 
          ot.Fecha_Creacion DESC;
      `,
      {
        replacements: { email: emailPaciente },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Formatear las fechas
    const ordenesConFormato = ordenesInformadas.map((orden) => ({
      ...orden,
      FechaCreacion: formatDate(orden.FechaCreacion),
      FechaEntrega: formatDate(orden.FechaEntrega),
    }));

    // Renderizar la vista con las órdenes del paciente
    res.render("portalPaciente", { ordenes: ordenesConFormato });
  } catch (error) {
    console.error("Error al obtener órdenes informadas del paciente:", error);
    res.status(500).send("Hubo un problema al cargar las órdenes informadas.");
  }
});

// Función para formatear fechas

module.exports = router;
