// import express from 'express';
// import mongoose from 'mongoose';
// import Order from '../models/Order.js';
// import FoodItem from '../models/FoodItem.js';
// import axios from 'axios';

// const router = express.Router();

// // Create a new order
// router.post('/', async (req, res) => {
//   try {
//     const { restaurantName, customerName, customerAddress, location, email, foodItem } = req.body;

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

//     let assignedDriverId = null;
//     let assignedDriver = null;

//     try {
//       // Get the driver based on the location
//       const { data } = await axios.get(`http://localhost:5001/drivers/location/${location}`);

//       // Check if there are available drivers
//       if (data && data.length > 0) {
//         // Assign the first available driver
//         assignedDriver = data[0];
//         assignedDriverId = assignedDriver._id;

//         // Update the driver's availability to 'Unavailable' via the driver service
//         await axios.patch(`http://localhost:5001/drivers/${assignedDriverId}`, {
//           availability: 'Unavailable',
//         });
//       } else {
//         return res.status(404).json({ error: 'No available driver found in this location' });
//       }
//     } catch (error) {
//       console.error('Error fetching driver or assigning driver:', error);
//       return res.status(500).json({ error: 'Error assigning driver', details: error.message });
//     }

//     // Create the order
//     const order = new Order({
//       restaurantName,
//       customerName,
//       customerAddress,
//       location,
//       email,
//       foodItem,
//       assignedDriver: assignedDriverId,
//       driverName: assignedDriver.name, // Optionally include the driver's name
//       totalAmount,
//       status: 'Pending',
//     });

//     // Save the order to the database
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
import axios from 'axios';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  try {
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

    let assignedDriverId = null;
    let assignedDriver = null;

    try {
      // Get the driver based on the location
      const { data } = await axios.get(`http://localhost:5001/drivers/location/${location}`);

      // Check if there are available drivers
      if (data && data.length > 0) {
        // Assign the first available driver
        assignedDriver = data[0];
        assignedDriverId = assignedDriver._id;

        // Update the driver's availability to 'Unavailable' via the driver service
        await axios.patch(`http://localhost:5001/drivers/${assignedDriverId}`, {
          availability: 'Unavailable',
        });

        // Send driver assignment notification
        try {
          await axios.post('http://localhost:3000/api/notifications/delivery-assignment', {
            driverEmail: assignedDriver.email, // Assumes driver object has email
            orderDetails: {
              orderId: null, // Will update after order is saved
              customerName,
              address: customerAddress
            }
          });
        } catch (notificationError) {
          console.error('Failed to send driver assignment notification:', notificationError.response?.data || notificationError.message);
          // Continue despite notification failure
        }
      } else {
        return res.status(404).json({ error: 'No available driver found in this location' });
      }
    } catch (error) {
      console.error('Error fetching driver or assigning driver:', error);
      return res.status(500).json({ error: 'Error assigning driver', details: error.message });
    }

    // Create the order
    const order = new Order({
      restaurantName,
      customerName,
      customerAddress,
      location,
      email,
      foodItem,
      assignedDriver: assignedDriverId,
      driverName: assignedDriver.name,
      totalAmount,
      status: 'Pending',
    });

    // Save the order to the database
    await order.save();

    // // Calculate estimated delivery (e.g., 3 days from now)
    // const estimatedDelivery = new Date();
    // estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
    // const formattedEstimatedDelivery = estimatedDelivery.toISOString().split('T')[0]; // YYYY-MM-DD

    // Send order confirmation notification
    try {
      await axios.post('http://localhost:3003/notify/order-confirmation', {
        customerEmail: email,
        orderDetails: {
          orderId: order._id.toString(),
          total: totalAmount
          
        }
      });

      // Update the driver assignment notification with the orderId
      await axios.post('http://localhost:3003/notify/delivery-assignment', {
        driverEmail: assignedDriver.email,
        orderDetails: {
          orderId: order._id.toString(),
          customerName,
          address: customerAddress
        }
      });
    } catch (notificationError) {
      console.error('Failed to send order confirmation notification:', notificationError.response?.data || notificationError.message);
      // Continue despite notification failure
    }

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

