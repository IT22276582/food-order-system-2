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
      const response = await axios.get('http://localhost:5004/api/orders');
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

      const response = await axios.post('http://localhost:5004/api/orders', orderPayload);
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
      const response = await axios.patch(`http://localhost:5004/api/orders/${orderId}/status`, {
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
        <h1 className="section-title">Available Food Items</h1>
        
        <div className="food-items-grid">
          {foodItems.map((food) => (
            <div key={food._id} className="food-item-card">
              <div className="food-header">
                <h3>{food.name}</h3>
                <span className={`availability ${food.availability.toLowerCase()}`}>
                  {food.availability}
                </span>
              </div>
              <p className="price">${food.price.toFixed(2)}</p>
              <p className="description">{food.description}</p>
              <div className="restaurant-info">
                <p><strong>{food.restaurant}</strong></p>
                <p>{food.address || 'Address not specified'}</p>
              </div>
              <button
                onClick={() => handleOrder(food)}
                className="order-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span> Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          ))}
        </div>

        <h2 className="section-title">Your Orders</h2>
        
        <div className="orders-grid">
          {orders.length === 0 ? (
            <p className="no-orders">No orders found</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-details">
                  <div className="customer-info">
                    <p><strong>Customer:</strong> {order.customerName}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Address:</strong> {order.customerAddress}</p>
                    <p><strong>Location:</strong> {order.location}</p>
                  </div>
                  
                  <div className="order-items">
                    <p><strong>Item:</strong> {order.foodItem.foodId.name}</p>
                    <p><strong>Quantity:</strong> {order.foodItem.quantity}</p>
                    <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                    <p><strong>Driver:</strong> {order.driverName || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Assigned')}
                    className="status-button assign"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Assign Driver'}
                  </button>
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
    </div>
  );
}

export default ViewFoodItems;