import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentWithStripe from '../payment';
import '../styles/viewfooditem.css';

function ViewFoodItems({ user }) {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [savedOrderId, setSavedOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFoodItems();
    fetchOrders();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items');
      setFoodItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch food items');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const handleOrder = async (food) => {
    const quantity = prompt(`Enter quantity for ${food.name}:`, 1);
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity');
      return;
    }

    const address = prompt(`Enter your address:`);
    if (!address) {
      alert('Address is required');
      return;
    }

    const location = prompt(`Enter your location:`);
    if (!location) {
      alert('Location is required');
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        restaurantName: food.restaurant,
        customerName: user.username,
        customerAddress: address,
        location: location,
        email: user.email,
        foodItem: {
          foodId: food._id,
          quantity: parseInt(quantity),
        },
        amount: food.price * quantity,
      };

      const response = await axios.post('http://localhost:5002/api/orders', orderPayload);
      setMessage(response.data.message || 'Order placed successfully!');
      setSavedOrderId(response.data.order._id);
      setOrderDetails(orderPayload);
      setShowPayment(true);
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      const response = await axios.patch(`http://localhost:5002/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      setMessage(response.data.message || 'Order status updated successfully!');
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPayment && orderDetails) {
    return (
      <div className="view-food-container">
        <div className="view-food-card">
          <h1>Payment Gateway</h1>
          <PaymentWithStripe orderId={savedOrderId} amount={orderDetails.amount} />
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="loading-message">Loading food items...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="view-food-container">
      <div className="view-food-card">
        <h1>Available Food Items</h1>
        <ul className="food-items-list">
          {foodItems.map((food) => (
            <li key={food._id} className="food-item">
              <h3>{food.name}</h3>
              <p>Price: ${food.price}</p>
              <p>Description: {food.description}</p>
              <p>Restaurant: {food.restaurant}</p>
              <p>Address: {food.address || 'Not specified'}</p>
              <p>Availability: {food.availability}</p>
              <button
                onClick={() => handleOrder(food)}
                className="order-button"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Order'}
              </button>
            </li>
          ))}
        </ul>

        <h2>Orders</h2>
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order._id} className="order-item">
              <h3>Order #{order._id}</h3>
              <p>Customer: {order.customerName}</p>
              <p>Address: {order.customerAddress}</p>
              <p>Location: {order.location}</p>
              <p>Email: {order.email}</p>
              <p>Status: {order.status}</p>
              <p>
                Food Item: {order.foodItem.foodId.name} - Quantity: {order.foodItem.quantity}
              </p>
              <p>Total Amount: ${order.totalAmount}</p>
              <p>Assigned Driver: {order.driverName || 'Not Assigned'}</p>
              <div className="order-actions">
                <button
                  onClick={() => handleUpdateStatus(order._id, 'Assigned')}
                  className="status-button assigned"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Mark as Assigned'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  className="status-button delivered"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Mark as Delivered'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {message && (
          <p className={message.includes('Failed') ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ViewFoodItems;