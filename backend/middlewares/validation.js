const { body, param, query } = require('express-validator');

// User validation rules
const userValidation = {
  register: [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .notEmpty()
      .withMessage('El apellido es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('rol')
      .optional()
      .isIn(['admin', 'administrativo'])
      .withMessage('Rol inválido'),
    
    body('telefono')
      .optional()
      .isMobilePhone('es-MX')
      .withMessage('Número de teléfono inválido')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
  ],

  updateProfile: [
    body('nombre')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('telefono')
      .optional()
      .isMobilePhone('es-MX')
      .withMessage('Número de teléfono inválido')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ],

  // Admin user management
  createUser: [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .notEmpty()
      .withMessage('El apellido es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('rol')
      .notEmpty()
      .withMessage('El rol es requerido')
      .isIn(['admin', 'administrativo'])
      .withMessage('Rol inválido'),
    
    body('telefono')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('El teléfono debe tener entre 8 y 20 caracteres')
      .matches(/^[\d\s\-\+\(\)]+$/)
      .withMessage('El teléfono solo puede contener números, espacios, guiones, paréntesis y signo más')
  ],

  updateUser: [
    body('nombre')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('rol')
      .optional()
      .isIn(['admin', 'administrativo'])
      .withMessage('Rol inválido'),
    
    body('telefono')
      .optional()
      .isMobilePhone('es-MX')
      .withMessage('Número de teléfono inválido'),
    
    body('activo')
      .optional()
      .isBoolean()
      .withMessage('El campo activo debe ser verdadero o falso')
  ],

  resetPassword: [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ]
};

// Cliente validation rules
const clienteValidation = {
  create: [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .notEmpty()
      .withMessage('El apellido es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('telefono')
      .optional()
      .isMobilePhone('es-MX')
      .withMessage('Número de teléfono inválido'),
    
    body('tipo_cliente')
      .optional()
      .isIn(['persona_fisica', 'persona_moral'])
      .withMessage('Tipo de cliente inválido'),
    
    body('estado_civil')
      .optional()
      .isIn(['soltero', 'casado', 'divorciado', 'viudo', 'union_libre'])
      .withMessage('Estado civil inválido'),
    
    body('fecha_nacimiento')
      .optional()
      .isISO8601()
      .withMessage('Fecha de nacimiento inválida')
  ],

  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de cliente inválido'),
    
    body('nombre')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('apellido')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    body('telefono')
      .optional()
      .isMobilePhone('es-MX')
      .withMessage('Número de teléfono inválido')
  ]
};

// Expediente validation rules
const expedienteValidation = {
  create: [
    body('titulo')
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ min: 5, max: 255 })
      .withMessage('El título debe tener entre 5 y 255 caracteres'),
    
    body('tipo_caso')
      .notEmpty()
      .withMessage('El tipo de caso es requerido')
      .isIn(['civil', 'penal', 'mercantil', 'familiar', 'laboral', 'administrativo', 'fiscal', 'corporativo', 'otro'])
      .withMessage('Tipo de caso inválido'),
    
    body('cliente_id')
      .isInt({ min: 1 })
      .withMessage('ID de cliente inválido'),
    
    body('abogado_responsable_id')
      .isInt({ min: 1 })
      .withMessage('ID de abogado responsable inválido'),
    
    body('prioridad')
      .optional()
      .isIn(['baja', 'media', 'alta', 'urgente'])
      .withMessage('Prioridad inválida'),
    
    body('honorarios_estimados')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Honorarios estimados inválidos')
  ]
};

// ExpedienteSimple validation rules (según requerimientos)
const expedienteSimpleValidation = {
  create: [
    body('nombre_solicitante')
      .notEmpty()
      .withMessage('El nombre del solicitante es requerido')
      .isLength({ min: 2, max: 255 })
      .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('dni')
      .notEmpty()
      .withMessage('El DNI es requerido')
      .isLength({ min: 8, max: 20 })
      .withMessage('El DNI debe tener entre 8 y 20 caracteres'),
    
    body('area')
      .notEmpty()
      .withMessage('El área es requerida')
      .isLength({ min: 2, max: 100 })
      .withMessage('El área debe tener entre 2 y 100 caracteres'),
    
    body('descripcion')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('numero_expediente')
      .optional()
      .isLength({ min: 4, max: 50 })
      .withMessage('El número de expediente debe tener entre 4 y 50 caracteres'),
    
    body('tipo_expediente')
      .optional()
      .isBoolean()
      .withMessage('El tipo de expediente debe ser un valor booleano')
  ],
  
  update: [
    body('nombre_solicitante')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('dni')
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage('El DNI debe tener entre 8 y 20 caracteres'),
    
    body('area')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('El área debe tener entre 2 y 100 caracteres'),
    
    body('descripcion')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('tipo_expediente')
      .optional()
      .isBoolean()
      .withMessage('El tipo de expediente debe ser un valor booleano')
  ]
};

// Common validation rules
const commonValidation = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID inválido')
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página inválida'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite inválido (máximo 100)')
  ]
};

module.exports = {
  userValidation,
  clienteValidation,
  expedienteValidation,
  expedienteSimpleValidation,
  commonValidation
};
