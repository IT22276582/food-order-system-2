import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './styles/driverorder.css'; // 

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const driverId = location.state?.driverId; // Assuming driverId is passed in the state

  useEffect(() => {
    console.log('Driver ID:', driverId); // Debug driverId
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5004/api/orders/driver', {
        params: { driverId },
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5004/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      setMessage(response.data.message || 'Order status updated successfully!');
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="orders-dashboard">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p className="orders-subtitle">View and manage customer orders</p>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div className="order-details">
              <div className="customer-info">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Address:</strong> {order.customerAddress}</p>
                <p><strong>Location:</strong> {order.location}</p>
              </div>

              <div className="order-items">
                <h4>Order Items</h4>
                <div className="food-item">
                  <p><strong>{order.foodItem.foodId.name}</strong></p>
                  <p>Quantity: {order.foodItem.quantity}</p>
                </div>
              </div>

              <div className="order-summary">
                <p className="total-amount">Total: ${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="order-actions">
              {order.status !== 'Delivered' && (
                <button
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  className="deliver-button"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default ViewOrders;