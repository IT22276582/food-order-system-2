import { Router } from 'express';
const router = Router();
import authController from '../controllers/authController';
import authenticateToken from '../middleware/authMiddleware';

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route example
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;