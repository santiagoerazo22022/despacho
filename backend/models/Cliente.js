const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  rfc: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  tipo_cliente: {
    type: DataTypes.ENUM('persona_fisica', 'persona_moral'),
    allowNull: false,
    defaultValue: 'persona_fisica'
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profesion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado_civil: {
    type: DataTypes.ENUM('soltero', 'casado', 'divorciado', 'viudo', 'union_libre'),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  indexes: [
    {
      fields: ['dni']
    },
    {
      fields: ['rfc']
    },
    {
      fields: ['email']
    }
  ]
});

module.exports = Cliente;
