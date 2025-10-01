const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Actuacion = sequelize.define('Actuacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_actuacion: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  fecha_carga: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  nombre_solicitante: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  area: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nombre_archivo_escaneado: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ruta_archivo_escaneado: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Foreign Key - ID del usuario que lo creó
  usuario_creador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Campo para el comprobante PDF generado
  ruta_comprobante_pdf: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'actuaciones',
  timestamps: true,
  indexes: [
    {
      fields: ['numero_actuacion']
    },
    {
      fields: ['usuario_creador_id']
    },
    {
      fields: ['area']
    }
  ]
});

module.exports = Actuacion;
