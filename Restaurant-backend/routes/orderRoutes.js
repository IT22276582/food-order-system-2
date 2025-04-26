import express from 'express';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Restaurant from '../models/Restaurant-register.js';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { restaurantId, customerName, customerAddress, location, foodItem } = req.body;

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ error: 'Restaurant not found' });
    }

    // Validate food item and calculate total amount
    let totalAmount = 0;
    const food = await FoodItem.findById(foodItem.foodId);

    if (!food || food.availability !== 'Available') {
      return res.status(400).json({ error: `Food item ${foodItem.foodId} is not available` });
    }
    totalAmount += food.price * foodItem.quantity;

    // Find an available driver in the same location as the customer
    const driver = await Driver.findOne({
      location: { $regex: `^${location}$`, $options: 'i' },
      availability: 'Available',
    });

    if (!driver) {
      return res.status(400).json({ error: 'No available drivers in the customer location' });
    }

    // Create the order
    const order = new Order({
      restaurantId,
      customerName,
      customerAddress,
      location,
      foodItem,
      totalAmount,
      assignedDriver: driver._id,
      status: 'Assigned',
    });

    // Update driver availability
    driver.availability = 'Unavailable';
    await driver.save();
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('foodItem.foodId')
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
      .populate('foodItem.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Get a specific order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('foodItem.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');
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
      .populate('foodItem.foodId')
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
      .populate('foodItem.foodId')
      .populate('assignedDriver')
      .populate('restaurantId');

    res.json({ message: 'Driver assigned successfully', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign driver', details: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If the order had an assigned driver, make them available again
    if (order.assignedDriver) {
      const driver = await Driver.findById(order.assignedDriver);
      if (driver) {
        driver.availability = 'Available';
        await driver.save();
      }
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

export default router;