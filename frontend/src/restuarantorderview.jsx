import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/orders'); // Replace with your backend URL
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5002/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      setMessage(response.data.message || 'Order status updated successfully!');
      fetchOrders(); // Refresh the orders list after updating the status
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update order status');
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Orders</h1>
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
            <p>Location: {order.location}</p>
            <p>Email: {order.email}</p>

            <p>Status: {order.status}</p>
            <p>Food Item: {order.foodItem.foodId.name} - Quantity: {order.foodItem.quantity}</p>
            <p>Total Amount: ${order.totalAmount}</p>
            <button
              onClick={() => handleUpdateStatus(order._id, 'Assigned')}
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
              Mark as Assigned
            </button>
           
          </li>
        ))}
      </ul>

      {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

export default ViewOrders;