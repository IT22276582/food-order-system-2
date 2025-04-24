import express from 'express';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
// import Restaurant from '../models/Restaurant.js';
// import Driver from '../models/Driver.js';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerAddress, foodItems } = req.body;

    // Validate food items and calculate total amount
    let totalAmount = 0;
    for (const item of foodItems) {
      const food = await FoodItem.findById(item.foodId);
      if (!food || food.availability !== 'Available') {
        return res.status(400).json({ error: `Food item ${item.foodId} is not available` });
      }
      totalAmount += food.price * item.quantity;
    }

    const order = new Order({ customerName, customerAddress, foodItems, totalAmount });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('foodItems.foodId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
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
router.patch('/:id/assign-driver', async (req, res) => {
  try {
    const { assignedDriver } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { assignedDriver }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Driver assigned successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign driver', details: err.message });
  }
});

export default router;