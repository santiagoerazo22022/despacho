const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { sequelize, testConnection } = require('./config/connection');
const { User } = require('./models');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const { handleUploadError } = require('./middlewares/upload');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clienteRoutes = require('./routes/clientes');
const expedienteRoutes = require('./routes/expedientes');
const expedienteSimpleRoutes = require('./routes/expedientesSimple');
const actuacionRoutes = require('./routes/actuaciones');
const decretoRoutes = require('./routes/decretos');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use('/api/', limiter);

// CORS configuration - Permitir acceso desde localhost y red local
const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://192.168.1.115:3001', // Reemplaza con tu IP de red local
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_NETWORK
].filter(Boolean); // Eliminar valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En desarrollo, permitir cualquier origen de localhost o IP local
      if (process.env.NODE_ENV === 'development') {
        const isLocalhost = origin.includes('localhost') || 
                           origin.includes('127.0.0.1') || 
                           origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/);
        if (isLocalhost) {
          return callback(null, true);
        }
      }
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded documents)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión - Oficina de Despacho General funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api/expedientes-simple', expedienteSimpleRoutes);
app.use('/api/actuaciones', actuacionRoutes);
app.use('/api/decretos', decretoRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API del Sistema de Gestión - Oficina de Despacho General',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users (admin only)',
      clientes: '/api/clientes',
      expedientes: '/api/expedientes',
      expedientesSimple: '/api/expedientes-simple',
      actuaciones: '/api/actuaciones',
      decretos: '/api/decretos',
      documentos: '/api/expedientes/:id/documentos'
    }
  });
});

// 404 handler for API routes
app.use('/api', (req, res, next) => {
  // Solo manejar rutas que no fueron capturadas por otros middlewares
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado'
    });
  }
});

// Upload error handling middleware
app.use(handleUploadError);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 3000;

// Function to create admin user if it doesn't exist
const createAdminUserIfNotExists = async () => {
  try {
    const existingAdmin = await User.findOne({
      where: { email: 'admin@sistema.com' }
    });

    if (!existingAdmin) {
      const adminUser = await User.create({
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@sistema.com',
        password: 'admin123', // Se encripta automáticamente
        rol: 'admin',
        activo: true
      });

      console.log('🎉 Usuario administrador creado automáticamente:');
      console.log(`   Email: admin@sistema.com`);
      console.log(`   Contraseña: admin123`);
      console.log(`   ID: ${adminUser.id}`);
    } else {
      console.log('✅ Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error.message);
  }
};

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false // Never force in production
    });
    
    console.log('✅ Database models synchronized successfully');

    // Create admin user if it doesn't exist
    await createAdminUserIfNotExists();

    // Start server - Escuchar en todas las interfaces de red para acceso desde red local
    const HOST = process.env.HOST || '0.0.0.0'; // Permitir acceso desde red local
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Network access: http://192.168.1.115:${PORT}/api`); // Reemplaza con tu IP
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
