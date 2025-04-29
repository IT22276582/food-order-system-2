import express from 'express';
import OrderController from '../controllers/OrderController.js';

const router = express.Router();

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', OrderController.updateOrderStatus);
router.delete('/:id', OrderController.deleteOrder);

export default router;