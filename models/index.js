const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

// Importar modelos
const Examen = require("./examen");
const Determinacion = require("./determinacion");
const Muestra = require("./muestra");
const OrdenesExamenes = require("./ordenes_examen");
const OrdenesTrabajo = require("./ordenes_trabajo");
const Paciente = require("./paciente");
const Resultado = require("./resultado");
const ValoresReferencia = require("./valores_referencia");
const TiposMuestra = require("./tipos_muestra");

// Definir asociaciones
Muestra.belongsTo(Paciente, { foreignKey: "id_paciente" });
Muestra.belongsTo(OrdenesTrabajo, { foreignKey: "id_orden" });
OrdenesTrabajo.hasMany(Muestra, { foreignKey: "id_orden" });
OrdenesTrabajo.hasMany(Resultado, { foreignKey: "id_Orden" });
Resultado.belongsTo(Determinacion, { foreignKey: "id_determinacion" });
Resultado.belongsTo(Muestra, { foreignKey: "id_Muestra" });
Resultado.belongsTo(OrdenesTrabajo, { foreignKey: "id_Orden" });

// Asociaciones entre TiposMuestra y Examen
TiposMuestra.hasMany(Examen, {
  foreignKey: "idTipoMuestra", // Clave foránea en Examen
  as: "examenes", // Alias para obtener exámenes relacionados
});

Examen.belongsTo(TiposMuestra, {
  foreignKey: "idTipoMuestra", // Clave foránea en Examen
  as: "tipoMuestra", // Alias para acceder al tipo de muestra
});

// Exportar modelos
module.exports = {
  sequelize,
  Examen,
  Determinacion,
  Muestra,
  OrdenesExamenes,
  OrdenesTrabajo,
  Paciente,
  Resultado,
  ValoresReferencia,
  TiposMuestra, // Asegúrate de incluir el nuevo modelo
};
