const { sequelize } = require('../config/connection');

// Import all models
const User = require('./User');
const Cliente = require('./Cliente');
const Expediente = require('./Expediente');
const ExpedienteSimple = require('./ExpedienteSimple');
const Documento = require('./Documento');
const Cita = require('./Cita');
const Pago = require('./Pago');
const Decreto = require('./Decreto');

// Define associations
// User associations
User.hasMany(Expediente, { 
  foreignKey: 'abogado_responsable_id', 
  as: 'expedientes_responsable' 
});

User.hasMany(Documento, { 
  foreignKey: 'subido_por', 
  as: 'documentos_subidos' 
});

User.hasMany(Cita, { 
  foreignKey: 'abogado_id', 
  as: 'citas' 
});

User.hasMany(Pago, { 
  foreignKey: 'recibido_por', 
  as: 'pagos_recibidos' 
});

// ExpedienteSimple associations
User.hasMany(ExpedienteSimple, { 
  foreignKey: 'usuario_creador_id', 
  as: 'expedientes_simples' 
});

ExpedienteSimple.belongsTo(User, { 
  foreignKey: 'usuario_creador_id', 
  as: 'usuario_creador' 
});

// Decreto associations
User.hasMany(Decreto, { 
  foreignKey: 'usuario_creador_id', 
  as: 'decretos_creados' 
});

Decreto.belongsTo(User, { 
  foreignKey: 'usuario_creador_id', 
  as: 'usuario_creador' 
});

Decreto.belongsTo(ExpedienteSimple, { 
  foreignKey: 'expediente_simple_id', 
  as: 'expediente_vinculado' 
});

ExpedienteSimple.hasMany(Decreto, { 
  foreignKey: 'expediente_simple_id', 
  as: 'decretos_vinculados' 
});

// Cliente associations
Cliente.hasMany(Expediente, { 
  foreignKey: 'cliente_id', 
  as: 'expedientes' 
});

Cliente.hasMany(Cita, { 
  foreignKey: 'cliente_id', 
  as: 'citas' 
});

Cliente.hasMany(Pago, { 
  foreignKey: 'cliente_id', 
  as: 'pagos' 
});

// Expediente associations
Expediente.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

Expediente.belongsTo(User, { 
  foreignKey: 'abogado_responsable_id', 
  as: 'abogado_responsable' 
});

Expediente.hasMany(Documento, { 
  foreignKey: 'expediente_id', 
  as: 'documentos' 
});

Expediente.hasMany(Cita, { 
  foreignKey: 'expediente_id', 
  as: 'citas' 
});

Expediente.hasMany(Pago, { 
  foreignKey: 'expediente_id', 
  as: 'pagos' 
});

// Documento associations
Documento.belongsTo(Expediente, { 
  foreignKey: 'expediente_id', 
  as: 'expediente' 
});

Documento.belongsTo(User, { 
  foreignKey: 'subido_por', 
  as: 'usuario_subio' 
});

// Cita associations
Cita.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

Cita.belongsTo(User, { 
  foreignKey: 'abogado_id', 
  as: 'abogado' 
});

Cita.belongsTo(Expediente, { 
  foreignKey: 'expediente_id', 
  as: 'expediente' 
});

// Pago associations
Pago.belongsTo(Expediente, { 
  foreignKey: 'expediente_id', 
  as: 'expediente' 
});

Pago.belongsTo(Cliente, { 
  foreignKey: 'cliente_id', 
  as: 'cliente' 
});

Pago.belongsTo(User, { 
  foreignKey: 'recibido_por', 
  as: 'usuario_recibio' 
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Cliente,
  Expediente,
  ExpedienteSimple,
  Documento,
  Cita,
  Pago,
  Decreto
};