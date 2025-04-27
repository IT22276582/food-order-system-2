import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewFoodItems() {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFoodItems();
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

  const handleOrder = async (food) => {
    const quantity = prompt(`Enter quantity for ${food.name}:`, 1);
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity');
      return;
    }
    //view food items
    try {
      const orderPayload = {
        restaurantName: food.restaurant, // Use restaurant name as a string
        customerName: 'John Doe', // Replace with actual customer name
        customerAddress: '123 Main St', // Replace with actual customer address
        location: 'Downtown', // Replace with actual location
        foodItem: {
          foodId: food._id,
          quantity: parseInt(quantity),
        },
      };

      const response = await axios.post('http://localhost:5002/api/orders', orderPayload);
      setMessage(response.data.message || 'Order placed successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to place order');
    }
  };

  if (loading) {
    return <p>Loading food items...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
      {message && <p style={{ color: 'green', marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

export default ViewFoodItems;