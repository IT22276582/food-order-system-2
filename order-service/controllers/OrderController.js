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
      const { restaurantName, customerName, customerAddress, location, email, foodItem } = req.body;

      // Validate required fields
      if (!restaurantName || !customerName || !customerAddress || !location || !email || !foodItem) {
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

      // Calculate total amount
      const totalAmount = food.price * foodItem.quantity;

      let assignedDriverId = null;
      let assignedDriver = null;

      try {
        // Get driver from Driver Service
        const { data } = await axios.get(`${DRIVER_SERVICE_URL}/drivers/location/${location}`);
        if (data && data.length > 0) {
          assignedDriver = data[0];
          assignedDriverId = assignedDriver._id;

          // Update driver availability
          await axios.patch(`${DRIVER_SERVICE_URL}/drivers/${assignedDriverId}`, {
            availability: 'Unavailable',
          });

          // Send driver assignment notification
          try {
            await axios.post(`${NOTIFICATION_SERVICE_URL}/notify/delivery-assignment`, {
              driverEmail: assignedDriver.email,
              orderDetails: {
                orderId: null, // Updated after order save
                customerName,
                address: customerAddress,
              },
            });
          } catch (notificationError) {
            console.error('Failed to send driver assignment notification:', notificationError.response?.data || notificationError.message);
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

      // Save the order
      await order.save();

      // Send order confirmation notification
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/notify/order-confirmation`, {
          customerEmail: email,
          orderDetails: {
            orderId: order._id.toString(),
            total: totalAmount,
          },
        });

        // Update driver assignment notification with orderId
        await axios.post(`${NOTIFICATION_SERVICE_URL}/notify/delivery-assignment`, {
          driverEmail: assignedDriver.email,
          orderDetails: {
            orderId: order._id.toString(),
            customerName,
            address: customerAddress,
          },
        });
      } catch (notificationError) {
        console.error('Failed to send order confirmation notification:', notificationError.response?.data || notificationError.message);
      }

      res.status(201).json({ message: 'Order created successfully', order });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const orders = await Order.find();
      // Fetch food item details for each order
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`);
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
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      // Fetch food item details
      try {
        const foodResponse = await axios.get(`${RESTAURANT_SERVICE_URL}/api/food-items/${order.foodItem.foodId}`);
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