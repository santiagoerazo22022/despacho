const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_recibo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  concepto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  metodo_pago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'cheque', 'tarjeta', 'otro'),
    allowNull: false,
    defaultValue: 'efectivo'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'cancelado', 'reembolsado'),
    allowNull: false,
    defaultValue: 'pagado'
  },
  referencia_pago: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  comprobante_generado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ruta_comprobante: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Foreign Keys
  expediente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  recibido_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'pagos',
  timestamps: true,
  indexes: [
    {
      fields: ['numero_recibo']
    },
    {
      fields: ['expediente_id']
    },
    {
      fields: ['cliente_id']
    },
    {
      fields: ['fecha_pago']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Pago;
