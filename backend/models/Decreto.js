const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Decreto = sequelize.define('Decreto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_decreto: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  tipo_documento: {
    type: DataTypes.ENUM('decreto', 'resolucion'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_emision: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_vigencia: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('vigente', 'suspendido', 'derogado', 'vencido'),
    allowNull: false,
    defaultValue: 'vigente'
  },
  autoridad_emisora: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  secretaria: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Secretaría específica para resoluciones'
  },
  numero_expediente_vinculado: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número del expediente o actuación vinculado'
  },
  tipo_expediente_vinculado: {
    type: DataTypes.ENUM('expediente', 'actuacion'),
    allowNull: true,
    comment: 'Tipo del expediente vinculado'
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ruta_archivo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Foreign Keys
  expediente_simple_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'expedientes_simple',
      key: 'id'
    },
    comment: 'Referencia al expediente simple vinculado'
  },
  usuario_creador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'decretos',
  timestamps: true,
  indexes: [
    {
      fields: ['numero_decreto']
    },
    {
      fields: ['tipo_documento']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_emision']
    },
    {
      fields: ['numero_expediente_vinculado']
    },
    {
      fields: ['expediente_simple_id']
    },
    {
      fields: ['usuario_creador_id']
    }
  ]
});

module.exports = Decreto;
