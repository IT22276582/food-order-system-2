import express from 'express';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

import Restaurant from '../models/Restaurant.js';
import Driver from '../models/Driver.js';


const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { restaurantId, customerName, customerAddress, foodItems } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ error: 'Restaurant not found' });
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

    // Find an available driver in the same location as the restaurant
    // const driver = await Driver.findOne({ location: restaurant.address, availability: 'Available' });

    const driver = await Driver.findOne({
      location: { $regex: `^${restaurant.address}$`, $options: 'i' },
      availability: 'Available',
    });
    
    // Check if a driver is available 
    if (!driver) {
      return res.status(400).json({ error: 'No available drivers in the restaurant location' });
    }


  

    // Create the order with assigned driver and status
    const order = new Order({
      restaurantId,
      customerName,
      customerAddress,
      foodItems,
      totalAmount,
      assignedDriver: driver._id,
      status: 'Assigned', // Set status to Assigned
    });

    // Update driver availability
    driver.availability = 'Unavailable';
    await driver.save();

    // Save the order
    await order.save();

    // Populate driver, food items, and restaurant for response
    const populatedOrder = await Order.findById(order._id)
      .populate('foodItems.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');

    res.status(201).json({ message: 'Order placed successfully with driver assigned', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('foodItems.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');
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

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If status is set to Delivered, make the driver available again
    if (status === 'Delivered' && order.assignedDriver) {
      const driver = await Driver.findById(order.assignedDriver);
      if (driver) {
        driver.availability = 'Available';
        await driver.save();
      }
    }

    order.status = status;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('foodItems.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');

    res.json({ message: 'Order status updated successfully', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Assign a driver to an order (optional, for manual reassignment)
router.patch('/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const driver = await Driver.findById(driverId);
    if (!driver || driver.availability !== 'Available') {
      return res.status(400).json({ error: 'Driver not found or not available' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If there's an existing driver, make them available
    if (order.assignedDriver) {
      const previousDriver = await Driver.findById(order.assignedDriver);
      if (previousDriver) {
        previousDriver.availability = 'Available';
        await previousDriver.save();
      }
    }

    // Assign new driver and update status
    order.assignedDriver = driverId;
    order.status = 'Assigned';
    driver.availability = 'Unavailable';

    await order.save();
    await driver.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('foodItems.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');

    res.json({ message: 'Driver assigned successfully', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign driver', details: err.message });
  }
});

export default router;