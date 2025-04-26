import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrdersPage() {
  const [availableFoods, setAvailableFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: '',
    customerAddress: '',
    location: '',
    quantity: 1,
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

  // Handle selecting a food item
  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  // Handle input changes for customer details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Place the order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    try {
      const totalAmount = selectedFood.price * customerDetails.quantity;

      const newOrder = {
        restaurantId: selectedFood.restaurantId,
        customerName: customerDetails.customerName,
        customerAddress: customerDetails.customerAddress,
        foodItem: {
          foodId: selectedFood._id,
          quantity: customerDetails.quantity,
        },
        totalAmount,
      };

      const response = await axios.post('http://localhost:5002/api/orders', newOrder);
      setMessage(response.data.message || 'Order placed successfully!');
      setSelectedFood(null);
      setCustomerDetails({
        customerName: '',
        customerAddress: '',
        location: '',
        quantity: 1,
      });
      fetchOrders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred while placing the order');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manage Orders</h1>

      {/* Show Available Foods */}
      {!selectedFood ? (
        <>
          <h2>Select a Food Item</h2>
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
                <h3>{food.name}</h3>
                <p>Price: ${food.price}</p>
                <button
                  onClick={() => handleSelectFood(food)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Order This
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {/* Show Customer Details Form */}
          <h2>Enter Your Details</h2>
          <form onSubmit={handlePlaceOrder} style={{ marginBottom: '20px' }}>
            <div>
              <strong>Selected Food:</strong> {selectedFood.name} (${selectedFood.price})
            </div>
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                name="customerName"
                placeholder="Customer Name"
                value={customerDetails.customerName}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
            <div>
              <input
                type="text"
                name="customerAddress"
                placeholder="Customer Address"
                value={customerDetails.customerAddress}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
            <div>
              <input
                type="text"
                name="location"
                placeholder="Location (City/Area)"
                value={customerDetails.location}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                min="1"
                value={customerDetails.quantity}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
            </div>
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
            <button
              type="button"
              onClick={() => setSelectedFood(null)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Cancel
            </button>
          </form>
        </>
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
            <h3>Order #{order._id}</h3>
            <p>Customer: {order.customerName}</p>
            <p>Address: {order.customerAddress}</p>
            <p>Status: {order.status}</p>
            <p>Driver: {order.assignedDriver ? order.assignedDriver.name : 'Not Assigned'}</p>
            <h4>Food Item:</h4>
            <p>
              {order.foodItem?.foodId?.name || 'Unknown Food'} - Quantity: {order.foodItem?.quantity}
            </p>
            <p>Total Amount: ${order.totalAmount}</p>
          </li>
        ))}
      </ul>

      {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

export default OrdersPage;
