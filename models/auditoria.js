const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Auditoria = sequelize.define("Auditoria", {
  Fecha_Hora_Operacion: {
    type: DataTypes.DATE,
  },
  Operacion_Realizada: {
    type: DataTypes.STRING,
  },
  Detalles_adicionales: {
    type: DataTypes.STRING,
  },
});
