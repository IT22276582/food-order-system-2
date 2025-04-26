import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { restaurantName, customerName, customerAddress, location, foodItem } = req.body;

    // Validate required fields
    if (!restaurantName || !customerName || !customerAddress || !location || !foodItem) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate food item
    if (!mongoose.Types.ObjectId.isValid(foodItem.foodId)) {
      return res.status(400).json({ error: 'Invalid food item ID' });
    }

    const food = await FoodItem.findById(foodItem.foodId);
    if (!food || food.availability !== 'Available') {
      return res.status(404).json({ error: 'Food item not available' });
    }

    // Calculate total amount
    const totalAmount = food.price * foodItem.quantity;

    // Create the order
    const order = new Order({
      restaurantName,
      customerName,
      customerAddress,
      location,
      foodItem,
      totalAmount,
      status: 'Pending',
    });

    await order.save();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('foodItem.foodId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('foodItem.foodId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Assigned', 'Delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

export default router;