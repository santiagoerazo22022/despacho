const express = require('express');
const router = express.Router();

const actuacionController = require('../controllers/actuacionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { expedienteSimpleValidation, commonValidation } = require('../middlewares/validation');
const { uploadSingle, handleUploadError } = require('../middlewares/upload');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', commonValidation.pagination, actuacionController.getActuaciones);
router.get('/:id', commonValidation.id, actuacionController.getActuacionById);

// Create actuacion with optional file upload
router.post('/', 
  uploadSingle('archivo_escaneado'), // Multer middleware for file upload
  expedienteSimpleValidation.create, 
  actuacionController.createActuacion
);

// Download actuacion PDF receipt
router.get('/:id/download-comprobante', 
  commonValidation.id, 
  actuacionController.downloadComprobantePDF
);

// Handle upload errors
router.use(handleUploadError);

module.exports = router;
