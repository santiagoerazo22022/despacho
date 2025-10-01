const express = require('express');
const router = express.Router();

const decretoController = require('../controllers/decretoController');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadSingle, handleUploadError } = require('../middlewares/upload');
const { decretoValidation, commonValidation } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', commonValidation.pagination, decretoController.getDecretos);
router.get('/expedientes-for-link', decretoController.getExpedientesForLink);
router.get('/:id', commonValidation.id, decretoController.getDecretoById);

// Create decreto with optional file upload
router.post('/', 
  uploadSingle('archivo'), // Multer middleware for file upload
  decretoValidation.create, 
  decretoController.createDecreto
);

// Update decreto (admin and administrativo can edit)
router.put('/:id', 
  commonValidation.id,
  uploadSingle('archivo'), // Multer middleware for file upload
  decretoValidation.update,
  decretoController.updateDecreto
);

// Delete decreto (admin and administrativo can delete)
router.delete('/:id', 
  commonValidation.id,
  decretoController.deleteDecreto
);

// Download decreto file
router.get('/:id/download-file', 
  commonValidation.id,
  decretoController.downloadDecretoFile
);

// Get expedientes vinculados to decreto
router.get('/:id/expedientes', 
  commonValidation.id,
  decretoController.getExpedientesVinculados
);

// Download expediente file from vinculated expediente
router.get('/:id/download-expediente-file', 
  commonValidation.id,
  decretoController.downloadExpedienteFileFromDecreto
);

// Handle upload errors
router.use(handleUploadError);

module.exports = router;
