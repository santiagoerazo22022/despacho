const express = require('express');
const router = express.Router();

const expedienteController = require('../controllers/expedienteController');
const { authenticate, authorize } = require('../middlewares/auth');
const { expedienteValidation, commonValidation } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', commonValidation.pagination, expedienteController.getExpedientes);
router.get('/:id', commonValidation.id, expedienteController.getExpedienteById);
router.post('/', expedienteValidation.create, expedienteController.createExpediente);
router.put('/:id', commonValidation.id, expedienteController.updateExpediente);
router.delete('/:id', authorize('admin'), commonValidation.id, expedienteController.deleteExpediente);

module.exports = router;
