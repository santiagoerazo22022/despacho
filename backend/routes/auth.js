const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { userValidation } = require('../middlewares/validation');

// Public routes
router.post('/register', userValidation.register, authController.register);
router.post('/login', userValidation.login, authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, userValidation.updateProfile, authController.updateProfile);
router.put('/change-password', authenticate, userValidation.changePassword, authController.changePassword);

module.exports = router;
