import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdersPage() {
  const [availableFoods, setAvailableFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerAddress: '',
    foodItems: [],
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAvailableFoods();
    fetchOrders();
  }, []);

  // Fetch available food items
  const fetchAvailableFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items');
      const availableFoods = response.data.filter((food) => food.availability === 'Available');
      setAvailableFoods(availableFoods);
    } catch (err) {
      console.error('Error fetching available foods:', err.message);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    }
  };

  // Add food item to the new order
  const handleAddFood = (foodId) => {
    const existingItem = newOrder.foodItems.find((item) => item.foodId === foodId);
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        foodItems: newOrder.foodItems.map((item) =>
          item.foodId === foodId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      setNewOrder({
        ...newOrder,
        foodItems: [...newOrder.foodItems, { foodId, quantity: 1 }],
      });
    }
  };

  // Place a new order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/orders', newOrder);
      setMessage(response.data.message);
      setNewOrder({ customerName: '', customerAddress: '', foodItems: [] }); // Clear the form
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5002/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      setMessage(response.data.message);
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  // Assign a driver to an order
  const handleAssignDriver = async (orderId, driverName) => {
    try {
      const response = await axios.patch(`http://localhost:5002/api/orders/${orderId}/assign-driver`, {
        assignedDriver: driverName,
      });
      setMessage(response.data.message);
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manage Orders</h1>

      {/* Place a New Order */}
      <form onSubmit={handlePlaceOrder} style={{ marginBottom: '20px' }}>
        <h2>Place a New Order</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={newOrder.customerName}
            onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="customerAddress"
            placeholder="Customer Address"
            value={newOrder.customerAddress}
            onChange={(e) => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <h3>Available Foods</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {availableFoods.map((food) => (
            <li
              key={food._id}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px',
              }}
            >
              <h4>{food.name}</h4>
              <p>Price: ${food.price}</p>
              <button
                type="button"
                onClick={() => handleAddFood(food._id)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Add to Order
              </button>
            </li>
          ))}
        </ul>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Place Order
        </button>
      </form>

      {/* Display All Orders */}
      <h2>All Orders</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {orders.map((order) => (
          <li
            key={order._id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
            }}
          >
            <h3>Order #{order._id}</h3>
            <p>Customer: {order.customerName}</p>
            <p>Address: {order.customerAddress}</p>
            <p>Status: {order.status}</p>
            <p>Driver: {order.assignedDriver || 'Not Assigned'}</p>
            <h4>Food Items:</h4>
            <ul>
              {order.foodItems.map((item) => (
                <li key={item.foodId._id}>
                  {item.foodId.name} - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
            <p>Total Amount: ${order.totalAmount}</p>
            <button
              onClick={() => handleUpdateStatus(order._id, 'Delivered')}
              style={{
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Mark as Delivered
            </button>
            <button
              onClick={() => handleAssignDriver(order._id, 'Driver Name')}
              style={{
                padding: '5px 10px',
                backgroundColor: '#ffc107',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Assign Driver
            </button>
          </li>
        ))}
      </ul>

      {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

export default OrdersPage;