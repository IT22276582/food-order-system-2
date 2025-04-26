// routes/paymentRoutes.js
import express from 'express';
import {
  initiatePayment,
  confirmPayment,
  refundPayment,
  getPaymentStatus,
} from '../controllers/paymentController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/confirm',confirmPayment);
router.post('/refund', refundPayment);
router.get('/:orderId', getPaymentStatus);

export default router;
