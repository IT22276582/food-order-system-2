import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentWithStripe from '../payment';

function ViewFoodItems({ user }) {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]); // State to store orders
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [paymentOrder, setPaymentOrder] = useState(null); // State to store the order for payment

  useEffect(() => {
    fetchFoodItems();
    fetchOrders(); // Fetch existing orders on page load
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items'); // Replace with your backend URL
      setFoodItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch food items');
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/orders'); // Replace with your backend URL
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
      };
  
      const response = await axios.post('http://localhost:5002/api/orders', orderPayload);
      setMessage(response.data.message || 'Order placed successfully!');

      // payment related start
      // Store order details for payment
      const order = response.data.order || { _id: response.data._id, totalAmount: food.price * quantity };
      setPaymentOrder({
        orderId: order._id,
        totalAmount: order.totalAmount || food.price * quantity, // Fallback to calculated amount
      });
      // payment related end
      fetchOrders(); // Refresh
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to place order');
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

  // payment related start

  const handlePaymentSuccess = () => {
    setMessage('Payment successful!');
    setPaymentOrder(null); // Return to food items
    fetchOrders(); // Refresh orders
  };

  const handlePaymentCancel = () => {
    setPaymentOrder(null); // Return to food items
    setMessage('Payment cancelled');
  };

  // payment related end


  if (loading) {
    return <p>Loading food items...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {paymentOrder ? (
        <div>
          <h2>Complete Payment for Order #{paymentOrder.orderId}</h2>
          <PaymentWithStripe
            orderId={paymentOrder.orderId}
            amount={paymentOrder.totalAmount}
            onSuccess={handlePaymentSuccess}
          />
          <button
            onClick={handlePaymentCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Cancel Payment
          </button>
        </div>
      ) : (
        <>
          <h1>Available Food Items</h1>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {foodItems.map((food) => (
              <li
                key={food._id}
                style={{
                  border: '1px solid #ddd',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <h3>{food.name}</h3>
                <p>Price: ${food.price}</p>
                <p>Description: {food.description}</p>
                <p>Restaurant: {food.restaurant}</p>
                <p>Address: {food.address}</p>
                <p>Availability: {food.availability}</p>
                <button
                  onClick={() => handleOrder(food)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Order
                </button>
              </li>
            ))}
          </ul>

          <h2>Orders</h2>
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
                <button
                  onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Mark as Delivered
                </button>
              </li>
            ))}
          </ul>

          {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
        </>
      )}
    </div>
  );
}

export default ViewFoodItems;