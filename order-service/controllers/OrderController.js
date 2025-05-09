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
      const calculatedAmount = food.price * foodItem.quantity * 300; // Convert to LKR
      if (amount !== calculatedAmount) {
        return res.status(400).json({ error: 'Invalid amount', expected: calculatedAmount, received: amount });
      }

      let assignedDriverId = null;
      let assignedDriver = null;

      try {
        // Get driver from Driver Service
        const { data } = await axios.get(`${DRIVER_SERVICE_URL}/drivers/location/${location}`, {
          headers: { Authorization: token },
        });
        if (data && data.length > 0) {
          assignedDriver = data[0];
          assignedDriverId = assignedDriver._id;

          // Update driver availability
          await axios.patch(
            `${DRIVER_SERVICE_URL}/drivers/${assignedDriverId}`,
            { availability: 'Unavailable' },
            { headers: { Authorization: token } }
          );

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
        }
      } catch (error) {
        console.error('Error fetching driver or assigning driver:', error.response?.data || error.message);
        // Continue without driver assignment for viva
        console.warn('Proceeding without driver assignment due to error');
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
        driverName: assignedDriver ? assignedDriver.name : 'Not assigned',
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
        if (assignedDriver) {
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
        }
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
      
      // Build query object
      const query = email ? { email } : {};
      
      const orders = await Order.find(query);
      // Fetch food item details for each order
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`, {
              headers: { Authorization: token },
            });
            return {
              ...order.toObject(),
              foodItem: { ...order.foodItem, foodId: foodResponse.data },
            };
          } catch (error) {
            console.error(`Failed to fetch food item ${order.foodItem.foodId}:`, error.message);
            return order.toObject();
          }
        })
      );
      res.json(enrichedOrders);
    } catch (err) {
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
        const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`, {
          headers: { Authorization: token },
        });
        const enrichedOrder = {
          ...order.toObject(),
          foodItem: { ...order.foodItem, foodId: foodResponse.data },
        };
        res.json(enrichedOrder);
      } catch (error) {
        console.error(`Failed to fetch food item ${order.foodItem.foodId}:`, error.message);
        res.json(order);
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch order', details: err.message });
    }
  }

  static async updateOrderStatus(req, res) {
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
  }

  static async deleteOrder(req, res) {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete order', details: err.message });
    }
  }
}

export default OrderController;