import mongoose from 'mongoose';
import axios from 'axios';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002';
const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || 'http://localhost:5001';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

class OrderController {
  static async createOrder(req, res) {
    try {
      const { restaurantName, customerName, customerAddress, location, email, foodItem, amount } = req.body;
      const token = req.headers.authorization; // Get token from headers

      // Validate required fields
      if (!restaurantName || !customerName || !customerAddress || !location || !foodItem) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate food item ID
      if (!mongoose.Types.ObjectId.isValid(foodItem.foodId)) {
        return res.status(400).json({ error: 'Invalid food item ID' });
      }

      // Fetch food item from Restaurant Service
      const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${foodItem.foodId}`);
      const food = foodResponse.data;
      if (!food || food.availability !== 'Available') {
        return res.status(404).json({ error: 'Food item not available' });
      }

      // Validate amount
      const calculatedAmount = food.price * foodItem.quantity*300; // Convert to LKR
      if (amount !== calculatedAmount) {
        return res.status(400).json({ error: 'Invalid amount', expected: calculatedAmount, received: amount });
      }

      let assignedDriverId = null;
      let assignedDriver = null;

      try {
        // Get drivers from Driver Service
        console.log(`Fetching drivers for location: ${location}`); // Debug
        const { data } = await axios.get(`${DRIVER_SERVICE_URL}/drivers/location/${location}`, {
          headers: { Authorization: token },
        });
        console.log('Drivers received:', data); // Debug

        // Find first available driver
        assignedDriver = data.find(driver => driver.availability === 'Available');
        if (!assignedDriver) {
          console.log('No available drivers found for location:', location); // Debug
          return res.status(400).json({ error: 'No available drivers for this location. Please try again later.' });
        }

        assignedDriverId = assignedDriver._id;
        console.log(`Selected driver: ${assignedDriver.name}, availability: ${assignedDriver.availability}`); // Debug

        // Update driver availability to Unavailable
        console.log(`Updating driver ${assignedDriverId} to Unavailable`); // Debug
        await axios.patch(
          `${DRIVER_SERVICE_URL}/drivers/${assignedDriverId}`,
          { availability: 'Unavailable' },
          { headers: { Authorization: token } }
        );
        console.log(`Driver ${assignedDriverId} updated successfully`); // Debug

        // Send driver assignment notification
        try {
          await axios.post(
            `${NOTIFICATION_SERVICE_URL}/notify/delivery-assignment`,
            {
              driverEmail: assignedDriver.email,
              orderDetails: {
                orderId: null, // Updated after order save
                customerName,
                address: customerAddress,
              },
            },
            { headers: { Authorization: token } }
          );
        } catch (notificationError) {
          console.error('Failed to send driver assignment notification:', notificationError.response?.data || notificationError.message);
        }
      } catch (error) {
        console.error('Error in driver assignment:', error.response?.data || error.message); // Debug
        return res.status(500).json({ error: 'Failed to assign driver', details: error.message });
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
        totalAmount: amount,
        status: 'Pending',
      });

      // Save the order
      await order.save();

      // Send order confirmation notification
      try {
        await axios.post(
          `${NOTIFICATION_SERVICE_URL}/notify/order-confirmation`,
          {
            customerEmail: email,
            orderDetails: {
              orderId: order._id.toString(),
              total: amount,
            },
          },
          { headers: { Authorization: token } }
        );

        // Update driver assignment notification with orderId
        await axios.post(
          `${NOTIFICATION_SERVICE_URL}/notify/delivery-assignment`,
          {
            driverEmail: assignedDriver.email,
            orderDetails: {
              orderId: order._id.toString(),
              customerName,
              address: customerAddress,
            },
          },
          { headers: { Authorization: token } }
        );
      } catch (notificationError) {
        console.error('Failed to send order confirmation notification:', notificationError.response?.data || notificationError.message);
      }

      res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
      console.error('Order creation error:', err.message);
      res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const { email } = req.query;
      const token = req.headers.authorization;
      
      console.log('getAllOrders - Query params:', req.query); // Debug query
      console.log('getAllOrders - Email:', email); // Debug email
      const query = email ? { email } : {};
      console.log('getAllOrders - MongoDB query:', query); // Debug query
      
      const orders = await Order.find(query);
      console.log('getAllOrders - Orders found:', orders.length); // Debug results
      
      // Fetch food item details for each order
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            console.log(`Fetching food item: ${order.foodItem.foodId}`); // Debug
            const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`, {
              headers: { Authorization: token },
            });
            return {
              ...order.toObject(),
              foodItem: { ...order.foodItem, foodId: foodResponse.data },
            };
          } catch (error) {
            console.error(`Failed to fetch food item ${order.foodItem.foodId}:`, {
              status: error.response?.status,
              message: error.response?.data?.error || error.message,
              orderId: order._id,
            }); // Detailed debug
            return {
              ...order.toObject(),
              foodItem: {
                ...order.foodItem,
                foodId: { name: 'Unknown Item', price: 0, description: 'Item not found' }, // Fallback
              },
            };
          }
        })
      );
      res.json(enrichedOrders);
    } catch (err) {
      console.error('getAllOrders - Error:', err.message); // Debug error
      res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const token = req.headers.authorization;
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      // Fetch food item details
      try {
        console.log(`Fetching food item for order ${req.params.id}: ${order.foodItem.foodId}`); // Debug
        const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`, {
          headers: { Authorization: token },
        });
        const enrichedOrder = {
          ...order.toObject(),
          foodItem: { ...order.foodItem, foodId: foodResponse.data },
        };
        res.json(enrichedOrder);
      } catch (error) {
        console.error(`Failed to fetch food item ${order.foodItem.foodId} for order ${req.params.id}:`, {
          status: error.response?.status,
          message: error.response?.data?.error || error.message,
        }); // Debug
        res.json({
          ...order.toObject(),
          foodItem: {
            ...order.foodItem,
            foodId: { name: 'Unknown Item', price: 0, description: 'Item not found' }, // Fallback
          },
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order', details: err.message });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const token = req.headers.authorization;
      if (!['Pending', 'Assigned', 'Delivered'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = status;

      // Reset driver availability if order is Delivered
      if (status === 'Delivered' && order.assignedDriver) {
        try {
          console.log(`Resetting driver ${order.assignedDriver} to Available`); // Debug
          const response = await axios.patch(
            `${DRIVER_SERVICE_URL}/drivers/${order.assignedDriver}`,
            { availability: 'Available' },
            { headers: { Authorization: token } }
          );
          console.log(`Driver ${order.assignedDriver} reset to Available:`, response.data); // Debug
        } catch (error) {
          console.error('Error resetting driver availability:', {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
            driverId: order.assignedDriver,
          }); // Detailed debug
          // Continue saving order even if driver update fails
        }
      }

      await order.save();
      res.json({ message: 'Order status updated successfully', order });
    } catch (err) {
      console.error('Error updating order status:', err.message); // Debug
      res.status(500).json({ error: 'Failed to update order status', details: err.message });
    }
  }

  static async deleteOrder(req, res) {
    try {
      const token = req.headers.authorization;
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Reset driver availability if order has an assigned driver
      if (order.assignedDriver) {
        try {
          console.log(`Resetting driver ${order.assignedDriver} to Available`); // Debug
          const response = await axios.patch(
            `${DRIVER_SERVICE_URL}/drivers/${order.assignedDriver}`,
            { availability: 'Available' },
            { headers: { Authorization: token } }
          );
          console.log(`Driver ${order.assignedDriver} reset to Available:`, response.data); // Debug
        } catch (error) {
          console.error('Error resetting driver availability on delete:', {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
            driverId: order.assignedDriver,
          }); // Detailed debug
          // Continue deleting order even if driver update fails
        }
      }

      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      console.error('Error deleting order:', err.message); // Debug
      res.status(500).json({ error: 'Failed to delete order', details: err.message });
    }
  }

  static async getOrdersByDriverId(req, res) {
    try {
      const { driverId } = req.query;
      console.log(mongoose.Types.ObjectId.isValid(driverId)); // Debug
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID' });
    }
      const orders = await Order.find({ assignedDriver: driverId });
      if (!orders.length) {
        return res.status(404).json({ error: 'No orders found for this driver' });
      }
      res.json(orders);
    } catch (err) {
      console.error('Error fetching orders by driver ID:', err.message); // Debug
      res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
  }

}

export default OrderController;