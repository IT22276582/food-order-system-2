import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/vieworders.css'; 

function ViewOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('ViewOrders - User object:', user); // Debug user
      if (!user || !user.email) {
        console.warn('ViewOrders - No user email available');
        setError('User information missing. Please log in.');
        setOrders([]);
        setLoading(false);
        return;
      }
      console.log('ViewOrders - Fetching orders for email:', user.email); // Debug email
      const response = await axios.get('http://localhost:5004/api/orders', {
        params: { email: user.email },
      });
      console.log('ViewOrders - Orders fetched:', response.data); // Debug response
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('ViewOrders - Fetch error:', err.response?.data); // Debug error
      setError(err.response?.data?.error || 'Failed to fetch orders');
      setOrders([]);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5004/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message || 'Order status updated successfully!');
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setIsProcessing(false);
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
        {orders.length === 0 ? (
          <p className="no-orders">No orders found</p>
        ) : (
          orders.map((order) => (
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
                  <p><strong>Driver:</strong> {order.driverName}</p>
                </div>
                
                <div className="order-items">
                  <h4>Order Items</h4>
                  <div className="food-item">
                    <p><strong>{order.foodItem.foodId?.name || 'Unknown Item'}</strong></p>
                    <p>Quantity: {order.foodItem.quantity}</p>
                    <p>Total: ${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="order-actions">
                <button
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  className="status-button deliver"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Mark Delivered'}
                </button>
              </div>
            </div>
          ))
        )}
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