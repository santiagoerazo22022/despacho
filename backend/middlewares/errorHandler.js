const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Error interno del servidor',
    statusCode: err.statusCode || 500
  };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    error.message = 'Error de validación';
    error.errors = messages;
    error.statusCode = 400;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Recurso ya existe';
    error.statusCode = 400;
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'Referencia inválida';
    error.statusCode = 400;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.statusCode = 401;
  }

  // Multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'Archivo demasiado grande';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Campo de archivo inesperado';
    error.statusCode = 400;
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = 'ID inválido';
    error.statusCode = 400;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
