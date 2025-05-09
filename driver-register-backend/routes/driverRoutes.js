import express from 'express';
import {
  addDriver,
  getAllDrivers,
  getDriverById,
  loginDriver,
  updateDriver,
  getDriversByLocation,
} from '../controllers/driverController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', addDriver);
router.get('/', verifyToken, getAllDrivers);
router.get('/:id', verifyToken, getDriverById);
router.post('/login', loginDriver);
router.patch('/:id', updateDriver);
router.get('/location/:location', getDriversByLocation);

export default router;