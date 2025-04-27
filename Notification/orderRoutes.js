import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Same secret as login-backend
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerName, customerAddress, customerPhone, customerEmail, foodItems } = req.body;

    // Validate input
    if (!customerName || !customerAddress || !customerPhone || !customerEmail || !foodItems) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate food items and calculate total amount
    let totalAmount = 0;
    for (const item of foodItems) {
      const food = await FoodItem.findById(item.foodId);
      if (!food || food.availability !== 'Available') {
        return res.status(400).json({ error: `Food item ${item.foodId} is not available` });
      }
      totalAmount += food.price * item.quantity;
    }

    // Generate unique orderId
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create and save order
    const order = new Order({
      orderId,
      customerName,
      customerAddress,
      customerPhone,
      customerEmail,
      foodItems,
      totalAmount,
    });
    await order.save();

    // Trigger customer notifications
    try {
      await axios.post('http://notification-backend:3003/notify/order-confirmation', {
        customerPhone,
        customerEmail,
        orderDetails: {
          orderId: order.orderId,
          total: order.totalAmount,
          estimatedDelivery: order.estimatedDelivery,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` }, // Pass JWT to notification-backend
      });
    } catch (notificationError) {
      console.error('Notification Error:', notificationError.message);
      // Continue even if notification fails to avoid blocking order placement
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('foodItems.foodId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Assigned', 'Delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Assign a driver to an order
router.patch('/:id/assign-driver', authMiddleware, async (req, res) => {
  try {
    const { assignedDriver, driverPhone } = req.body;

    // Validate input
    if (!assignedDriver || !driverPhone) {
      return res.status(400).json({ error: 'Missing assignedDriver or driverPhone' });
    }

    // Update order with driver details
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedDriver, driverPhone, status: 'Assigned' },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Trigger driver notification
    try {
      const token = req.headers.authorization?.split(' ')[1];
      await axios.post('http://notification-backend:3003/notify/delivery-assignment', {
        driverPhone,
        orderDetails: {
          orderId: order.orderId,
          customerName: order.customerName,
          address: order.customerAddress,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` }, // Pass JWT to notification-backend
      });
    } catch (notificationError) {
      console.error('Driver Notification Error:', notificationError.message);
      // Continue even if notification fails
    }

    res.json({ message: 'Driver assigned successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign driver', details: err.message });
  }
});

export default router;