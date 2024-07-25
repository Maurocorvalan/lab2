const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuarios = sequelize.define(
  "Usuarios",
  {
    id_Usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_usuario: {
      type: DataTypes.STRING,
    },
    rol: {
      type: DataTypes.STRING,
    },
    correo_electronico: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Usuarios",
    timestamps: false,
  }
);

module.exports = Usuarios;
