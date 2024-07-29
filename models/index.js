const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Examen = require('./examen');
const Determinacion = require('./determinacion');
const Muestra = require('./muestra');
const OrdenesExamenes = require('./ordenes_examen');
const OrdenesTrabajo = require('./ordenes_trabajo');
const Paciente = require('./paciente');
const Resultado = require('./resultado');
const ValoresReferencia = require('./valores_referencia');

// Definir asociaciones
Muestra.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Muestra.belongsTo(OrdenesTrabajo, { foreignKey: 'id_orden' });
OrdenesTrabajo.hasMany(Muestra, { foreignKey: 'id_orden' });
OrdenesTrabajo.hasMany(Resultado, { foreignKey: 'id_Orden' });
Resultado.belongsTo(Determinacion, { foreignKey: 'id_determinacion' });
Resultado.belongsTo(Muestra, { foreignKey: 'id_Muestra' });
Resultado.belongsTo(OrdenesTrabajo, { foreignKey: 'id_Orden' });

module.exports = {
  Muestra,
  Paciente,
  OrdenesTrabajo,
  Resultado,
  Determinacion,
};
