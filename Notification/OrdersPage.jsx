import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdersPage() {
  const [availableFoods, setAvailableFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    foodItems: [],
  });
  const [message, setMessage] = useState('');
  const [driverAssignment, setDriverAssignment] = useState({
    orderId: null,
    assignedDriver: '',
    driverPhone: '',
  });

  useEffect(() => {
    fetchAvailableFoods();
    fetchOrders();
  }, []);

  // Fetch available food items
  const fetchAvailableFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const availableFoods = response.data.filter((food) => food.availability === 'Available');
      setAvailableFoods(availableFoods);
    } catch (err) {
      setMessage('Error fetching available foods: ' + err.message);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrders(response.data);
    } catch (err) {
      setMessage('Error fetching orders: ' + err.message);
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
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in to place an order');
        return;
      }

      const response = await axios.post('http://localhost:5002/api/orders', newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Order placed successfully! You’ll receive an SMS and email confirmation.');
      setNewOrder({
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        customerEmail: '',
        foodItems: [],
      });
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to place order');
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5002/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update status');
    }
  };

  // Open driver assignment form
  const openDriverAssignment = (orderId) => {
    setDriverAssignment({ orderId, assignedDriver: '', driverPhone: '' });
  };

  // Assign a driver to an order
  const handleAssignDriver = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5002/api/orders/${driverAssignment.orderId}/assign-driver`,
        {
          assignedDriver: driverAssignment.assignedDriver,
          driverPhone: driverAssignment.driverPhone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Driver assigned successfully! Driver will receive an SMS notification.');
      setDriverAssignment({ orderId: null, assignedDriver: '', driverPhone: '' });
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to assign driver');
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
        <div style={{ marginBottom: '10px' }}>
          <input
            type="tel"
            name="customerPhone"
            placeholder="Phone (+94xxxxxxxxxx)"
            value={newOrder.customerPhone}
            onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
            required
            pattern="\+94[0-9]{9}"
            title="Phone number must start with +94 followed by 9 digits"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            name="customerEmail"
            placeholder="Email"
            value={newOrder.customerEmail}
            onChange={(e) => setNewOrder({ ...newOrder, customerEmail: e.target.value })}
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
              <p>Price: LKR {food.price}</p>
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
        <h4>Selected Items:</h4>
        <ul>
          {newOrder.foodItems.map((item) => {
            const food = availableFoods.find((f) => f._id === item.foodId);
            return (
              <li key={item.foodId}>
                {food?.name || 'Unknown'} - Quantity: {item.quantity}
              </li>
            );
          })}
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

      {/* Driver Assignment Form */}
      {driverAssignment.orderId && (
        <form onSubmit={handleAssignDriver} style={{ marginBottom: '20px' }}>
          <h2>Assign Driver for Order #{orders.find((o) => o._id === driverAssignment.orderId)?.orderId}</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Driver Name"
              value={driverAssignment.assignedDriver}
              onChange={(e) =>
                setDriverAssignment({ ...driverAssignment, assignedDriver: e.target.value })
              }
              required
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="tel"
              placeholder="Driver Phone (+94xxxxxxxxxx)"
              value={driverAssignment.driverPhone}
              onChange={(e) =>
                setDriverAssignment({ ...driverAssignment, driverPhone: e.target.value })
              }
              required
              pattern="\+94[0-9]{9}"
              title="Phone number must start with +94 followed by 9 digits"
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Confirm Driver Assignment
          </button>
          <button
            type="button"
            onClick={() => setDriverAssignment({ orderId: null, assignedDriver: '', driverPhone: '' })}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </form>
      )}

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
            <h3>Order #{order.orderId}</h3>
            <p>Customer: {order.customerName}</p>
            <p>Address: {order.customerAddress}</p>
            <p>Phone: {order.customerPhone}</p>
            <p>Email: {order.customerEmail}</p>
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
            <p>Total Amount: LKR {order.totalAmount}</p>
            <p>Estimated Delivery: {order.estimatedDelivery}</p>
            <button
              onClick={() => handleUpdateStatus(order._id, 'Delivered')}
              disabled={order.status === 'Delivered'}
              style={{
                padding: '5px 10px',
                backgroundColor: order.status === 'Delivered' ? '#6c757d' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: order.status === 'Delivered' ? 'not-allowed' : 'pointer',
                marginRight: '10px',
              }}
            >
              Mark as Delivered
            </button>
            <button
              onClick={() => openDriverAssignment(order._id)}
              disabled={order.assignedDriver}
              style={{
                padding: '5px 10px',
                backgroundColor: order.assignedDriver ? '#6c757d' : '#ffc107',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: order.assignedDriver ? 'not-allowed' : 'pointer',
              }}
            >
              Assign Driver
            </button>
          </li>
        ))}
      </ul>

      {message && (
        <p style={{ color: message.includes('Error') || message.includes('Failed') ? 'red' : 'green', marginTop: '20px' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default OrdersPage;