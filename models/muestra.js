const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Paciente = require("./paciente");


const Muestra = sequelize.define(
  "Muestra",
  {
    id_Muestra: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_Orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ordenes_trabajo",
        key: "id_Orden",
      },
    },
    id_Paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Paciente,
        key: "id_paciente", // Asegúrate de que coincida con la clave primaria de Paciente
      },
    },
    Tipo_Muestra: {
      type: DataTypes.STRING,
    },
    Fecha_Recepcion: {
      type: DataTypes.DATE,
    },
    estado: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
  }
);

Muestra.belongsTo(Paciente, { foreignKey: 'id_Paciente', as: 'Paciente' });

module.exports = Muestra;
