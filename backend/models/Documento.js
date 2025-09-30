const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connection');

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_documento: {
    type: DataTypes.ENUM(
      'contrato', 'demanda', 'contestacion', 'escrito', 'promocion',
      'oficio', 'acuerdo', 'sentencia', 'comprobante_pago', 'identificacion',
      'poder', 'certificado', 'factura', 'recibo', 'otro'
    ),
    allowNull: false
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  ruta_archivo: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  tamaño_archivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tipo_mime: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_documento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  es_confidencial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'revision', 'aprobado', 'archivado'),
    allowNull: false,
    defaultValue: 'borrador'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of tags'
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
  subido_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'documentos',
  timestamps: true,
  indexes: [
    {
      fields: ['expediente_id']
    },
    {
      fields: ['subido_por']
    },
    {
      fields: ['tipo_documento']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_documento']
    }
  ]
});

module.exports = Documento;
