const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Expediente = sequelize.define('Expediente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_expediente: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
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
  tipo_caso: {
    type: DataTypes.ENUM(
      'civil', 'penal', 'mercantil', 'familiar', 'laboral', 
      'administrativo', 'fiscal', 'corporativo', 'otro'
    ),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('activo', 'en_proceso', 'suspendido', 'cerrado', 'archivado'),
    allowNull: false,
    defaultValue: 'activo'
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    allowNull: false,
    defaultValue: 'media'
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_cierre: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  honorarios_estimados: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  honorarios_pagados: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  juzgado: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero_juzgado: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  juez: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contraparte: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Foreign Keys
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  abogado_responsable_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'expedientes',
  timestamps: true,
  indexes: [
    {
      fields: ['numero_expediente']
    },
    {
      fields: ['cliente_id']
    },
    {
      fields: ['abogado_responsable_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['tipo_caso']
    }
  ]
});

module.exports = Expediente;
