const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Examen = sequelize.define(
  "Examen",
  {
    id_examen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_examen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    codigo: {
      type: DataTypes.STRING,
    },
    tipo_Muestra:{
      type: DataTypes.STRING
    },
    estado: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: false,

    tableName: "examen",
  }
);

module.exports = Examen;
