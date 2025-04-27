// import express from 'express';
// import mongoose from 'mongoose';
// import Order from '../models/Order.js';
// import FoodItem from '../models/FoodItem.js';

// const router = express.Router();

// // Create a new order
// router.post('/', async (req, res) => {
//   try {
//     console.log('Request body:', req.body); // Debugging line 
//     const { restaurantName, customerName, customerAddress, location,email,foodItem } = req.body;

//     // Validate required fields
//     if (!restaurantName || !customerName || !customerAddress || !location || !email || !foodItem) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Validate food item
//     if (!mongoose.Types.ObjectId.isValid(foodItem.foodId)) {
//       return res.status(400).json({ error: 'Invalid food item ID' });
//     }

//     const food = await FoodItem.findById(foodItem.foodId);
//     if (!food || food.availability !== 'Available') {
//       return res.status(404).json({ error: 'Food item not available' });
//     }

//     // Calculate total amount
//     const totalAmount = food.price * foodItem.quantity;

//     // Create the order
//     const order = new Order({
//       restaurantName,
//       customerName,
//       customerAddress,
//       location,
//       email,
//       foodItem,
//       totalAmount,
//       status: 'Pending',
//     });

//     await order.save();

//     res.status(201).json({ message: 'Order created successfully', order });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to create order', details: err.message });
//   }
// });

// // Get all orders
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate('foodItem.foodId');
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
//   }
// });

// // Get a single order by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('foodItem.foodId');
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch order', details: err.message });
//   }
// });

// // Update order status
// router.patch('/:id/status', async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!['Pending', 'Assigned', 'Delivered'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status value' });
//     }

//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     order.status = status;
//     await order.save();

//     res.json({ message: 'Order status updated successfully', order });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update order status', details: err.message });
//   }
// });

// // Delete an order
// router.delete('/:id', async (req, res) => {
//   try {
//     const order = await Order.findByIdAndDelete(req.params.id);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }
//     res.json({ message: 'Order deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete order', details: err.message });
//   }
// });

// export default router;




import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import axios from 'axios'; // For notifying driver service

// Create a minimal Mongoose model for the drivers collection
const Driver = mongoose.model('Driver', new mongoose.Schema({
  location: String,
  availability: String,
}, { collection: 'drivers' }));

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debugging line 
    const { restaurantName, customerName, customerAddress, location, email, foodItem } = req.body;

    // Validate required fields
    if (!restaurantName || !customerName || !customerAddress || !location || !email || !foodItem) {
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
      email,
      foodItem,
      totalAmount,
      status: 'Pending', // Initial status
    });

    // Search for an available driver in the same location (case-insensitive) and update atomically
    const driver = await Driver.findOneAndUpdate(
      { 
        location: { $regex: `^${location}$`, $options: 'i' }, // Case-insensitive match
        availability: 'Available' 
      },
      { $set: { availability: 'Unavailable' } },
      { new: true } // Return the updated document
    );

    if (driver) {
      // Assign driver to order
      order.assignedDriver = driver._id;
      order.status = 'Assigned';

      // // Notify the driver service of the assignment (optional)
      // try {
      //   await axios.post('http://driver-service:3000/drivers/notify-assignment', {
      //     driverId: driver._id,
      //     orderId: order._id
      //   });
      // } catch (notifyErr) {
      //   console.error('Failed to notify driver service:', notifyErr.message);
      //   // Proceed even if notification fails; you may want to handle this differently
      // }
    } else {
      // No driver found, keep status as Pending and assignedDriver as null
      console.log('No available driver found for location:', location);
    }

    // Save the order
    await order.save();

    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      driverAssigned: !!driver // Indicates if a driver was assigned
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('foodItem.foodId');
    // Manually fetch driver details for each order
    const ordersWithDriver = await Promise.all(orders.map(async (order) => {
      if (order.assignedDriver) {
        const driver = await Driver.findById(order.assignedDriver);
        return { ...order.toObject(), assignedDriver: driver || null };
      }
      return order.toObject();
    }));
    res.json(ordersWithDriver);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('foodItem.foodId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Manually fetch driver details
    let orderWithDriver = order.toObject();
    if (order.assignedDriver) {
      const driver = await Driver.findById(order.assignedDriver);
      orderWithDriver.assignedDriver = driver || null;
    }
    res.json(orderWithDriver);
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
    // If status is Delivered, make the driver available again
    if (status === 'Delivered' && order.assignedDriver) {
      await Driver.findByIdAndUpdate(order.assignedDriver, { availability: 'Available' });
      // Notify driver service (optional)
      try {
        await axios.post('http://driver-service:3000/drivers/notify-availability', {
          driverId: order.assignedDriver,
          availability: 'Available'
        });
      } catch (notifyErr) {
        console.error('Failed to notify driver service:', notifyErr.message);
      }
    }
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // If order has an assigned driver, set driver availability back to Available
    if (order.assignedDriver) {
      await Driver.findByIdAndUpdate(order.assignedDriver, { availability: 'Available' });
      // Notify driver service (optional)
      try {
        await axios.post('http://driver-service:3000/drivers/notify-availability', {
          driverId: order.assignedDriver,
          availability: 'Available'
        });
      } catch (notifyErr) {
        console.error('Failed to notify driver service:', notifyErr.message);
      }
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

export default router;