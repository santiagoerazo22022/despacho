const express = require('express');
const router = express.Router();

const expedienteSimpleController = require('../controllers/expedienteSimpleController');
const { authenticate, authorize } = require('../middlewares/auth');
const { expedienteSimpleValidation, commonValidation } = require('../middlewares/validation');
const { uploadSingle, handleUploadError } = require('../middlewares/upload');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', commonValidation.pagination, expedienteSimpleController.getExpedientes);
router.get('/:id', commonValidation.id, expedienteSimpleController.getExpedienteById);

// Create expediente with optional file upload
router.post('/', 
  uploadSingle('archivo_escaneado'), // Multer middleware for file upload
  expedienteSimpleValidation.create, 
  expedienteSimpleController.createExpediente
);

// Update expediente (admin and administrativo can edit)
router.put('/:id', 
  commonValidation.id, 
  expedienteSimpleValidation.update,
  expedienteSimpleController.updateExpediente
);

// Delete expediente (admin and administrativo can delete)
router.delete('/:id', 
  commonValidation.id, 
  expedienteSimpleController.deleteExpediente
);

// Download expediente scanned file
router.get('/:id/download-file', 
  commonValidation.id, 
  expedienteSimpleController.downloadExpedienteFile
);

// Download expediente PDF receipt
router.get('/:id/download-comprobante', 
  commonValidation.id, 
  expedienteSimpleController.downloadComprobantePDF
);

// Handle upload errors
router.use(handleUploadError);

module.exports = router;

