const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateLogin } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

// POST /auth/login - Login (Principal or Teacher)
router.post('/login', authLimiter, validateLogin, AuthController.login);

// GET /auth/me - Get logged-in user profile
router.get('/me', authenticate, AuthController.getProfile);

module.exports = router;
