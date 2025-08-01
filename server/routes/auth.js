const express = require('express');
const router = express.Router();

// Import controllers and middleware
const authController = require('../controllers/authController');
const googleAuth = require('../services/googleAuth');
const { authenticate } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  handleValidationErrors
} = require('../middleware/validation');

// Email/Password Authentication Routes
router.post('/register', 
  authLimiter,
  validateRegistration,
  handleValidationErrors,
  authController.register
);

router.post('/login', 
  authLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authController.logout);

// Google OAuth Routes
router.get('/google', googleAuth.authenticate);

router.get('/google/callback', googleAuth.callback);

// Protected Routes (require authentication)
router.get('/me', authenticate, authController.getProfile);

router.put('/profile', 
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  authController.updateProfile
);

router.put('/change-password', 
  authenticate,
  validatePasswordChange,
  handleValidationErrors,
  authController.changePassword
);

// Google Account Management (Protected)
router.post('/google/link', authenticate, googleAuth.linkAccount);

router.delete('/google/unlink', authenticate, googleAuth.unlinkAccount);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;