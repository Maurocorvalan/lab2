const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Examen = require("./examen"); // Importa el modelo de Examen
const UnidadMedida = require("./unidadMedida"); // Importa el modelo de UnidadMedida

const Determinacion = sequelize.define(
  "determinaciones",
  {
    id_Determinacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_ValorReferencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Nombre_Determinacion: {
      type: DataTypes.STRING,
    },
    Valor: {
      type: DataTypes.DECIMAL(10, 2),
    },
    Unidad_Medida: {
      type: DataTypes.INTEGER,
    },
    Sexo: {
      type: DataTypes.STRING,
    },
    id_examen: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: false, // Deshabilita las columnas createdAt y updatedAt
  }
);

// Establece la relación con Examen
Determinacion.belongsTo(Examen, {
  foreignKey: "id_examen",
  targetKey: "id_examen",
  as: "examen", // Alias para la relación
});

// Establece la relación con UnidadMedida
Determinacion.belongsTo(UnidadMedida, {
  foreignKey: "Unidad_Medida",
  targetKey: "id_UnidadMedida",
  as: "unidadMedida", // Alias para la relación
});

module.exports = Determinacion;
