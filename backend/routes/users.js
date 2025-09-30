const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { userValidation, commonValidation } = require('../middlewares/validation');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Routes
router.get('/', commonValidation.pagination, userController.getUsers);
router.get('/stats', userController.getUserStats);
router.get('/:id', commonValidation.id, userController.getUserById);
router.post('/', userValidation.createUser, userController.createUser);
router.put('/:id', commonValidation.id, userValidation.updateUser, userController.updateUser);
router.delete('/:id', commonValidation.id, userController.deleteUser);
router.put('/:id/reset-password', commonValidation.id, userValidation.resetPassword, userController.resetUserPassword);

module.exports = router;

