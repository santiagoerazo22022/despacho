const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  tipo_cita: {
    type: DataTypes.ENUM('consulta', 'audiencia', 'junta', 'diligencia', 'otro'),
    allowNull: false,
    defaultValue: 'consulta'
  },
  estado: {
    type: DataTypes.ENUM('programada', 'confirmada', 'cancelada', 'completada'),
    allowNull: false,
    defaultValue: 'programada'
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  recordatorio_enviado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Foreign Keys
  expediente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'expedientes',
      key: 'id'
    }
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  abogado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'citas',
  timestamps: true,
  indexes: [
    {
      fields: ['fecha_inicio']
    },
    {
      fields: ['cliente_id']
    },
    {
      fields: ['abogado_id']
    },
    {
      fields: ['expediente_id']
    }
  ]
});

module.exports = Cita;
