const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController').default;
const authenticateToken = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

module.exports = router;