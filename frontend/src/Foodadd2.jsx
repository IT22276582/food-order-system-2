import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FoodAdd2Page() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    restaurant: '',
    address: '',
    availability: 'Available',
  });
  
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedRestaurant = localStorage.getItem('restaurant');
    if (storedRestaurant) {
      const restaurant = JSON.parse(storedRestaurant);
      setFormData(prevFormData => ({
        ...prevFormData,
        restaurant: restaurant.name || '',
        address: restaurant.address || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/food-items', formData);
      setMessage(response.data.message);
      setFormData({ name: '', price: '', description: '', restaurant: '',address: '', availability: 'Available' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Add Food Item</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="restaurant"
            placeholder="Restaurant Name"
            value={formData.restaurant}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            disabled
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="address"
            placeholder="address Name"
            value={formData.address}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            disabled
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Add Food Item
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
}

export default FoodAdd2Page;
