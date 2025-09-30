const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const { authenticate, authorize } = require('../middlewares/auth');
const { clienteValidation, commonValidation } = require('../middlewares/validation');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', commonValidation.pagination, clienteController.getClientes);
router.get('/:id', commonValidation.id, clienteController.getClienteById);
router.post('/', clienteValidation.create, clienteController.createCliente);
router.put('/:id', clienteValidation.update, clienteController.updateCliente);
router.delete('/:id', authorize('admin'), commonValidation.id, clienteController.deleteCliente);

module.exports = router;
