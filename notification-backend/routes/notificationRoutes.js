import { Router } from 'express';
const router = Router();
import { sendOrderConfirmation, sendDeliveryAssignment } from '../controllers/notificationController.js';

router.post('/order-confirmation', sendOrderConfirmation);
router.post('/delivery-assignment', sendDeliveryAssignment);

export default router;