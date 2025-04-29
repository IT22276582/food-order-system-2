import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/vieworders.css'; 

function ViewOrders() {
  // All existing state and functions remain exactly the same
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5004/api/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5004/api/orders/${orderId}/status`,
        { status: newStatus }
      );
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
    <div className="orders-container">
      <h1 className="page-header">Order Management</h1>
      
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
                  <p>Total: ${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="order-actions">
              <button
                onClick={() => handleUpdateStatus(order._id, 'Assigned')}
                className="status-button assign"
              >
                Assign Driver
              </button>
              <button
                onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                className="status-button deliver"
              >
                Mark Delivered
              </button>
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