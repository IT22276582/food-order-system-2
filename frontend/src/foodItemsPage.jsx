import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FoodItemsPage() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    restaurant: '',
    availability: 'Available', // Default value
  });

  const [foodItems, setFoodItems] = useState([]);
  const [message, setMessage] = useState('');
  const [editItemId, setEditItemId] = useState(null); // Track the item being edited

  // Fetch food items on component mount
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/food-items');
      setFoodItems(response.data);
    } catch (err) {
      console.error('Error fetching food items:', err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        // Update existing food item
        const response = await axios.put(`http://localhost:5002/api/food-items/${editItemId}`, formData);
        setMessage(response.data.message);
        setEditItemId(null); // Clear edit mode
      } else {
        // Add new food item
        const response = await axios.post('http://localhost:5002/api/food-items', formData);
        setMessage(response.data.message);
      }
      fetchFoodItems(); // Refresh the food items list
      setFormData({ name: '', price: '', description: '', restaurant: '', availability: 'Available' }); // Clear the form
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  const handleEdit = (item) => {
    setEditItemId(item._id); // Set the item to be edited
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      restaurant: item.restaurant,
      availability: item.availability,
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5002/api/food-items/${id}`);
      setMessage(response.data.message);
      fetchFoodItems(); // Refresh the food items list
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  const handleAvailabilityToggle = async (id, currentAvailability) => {
    try {
      const newAvailability = currentAvailability === 'Available' ? 'Unavailable' : 'Available';
      const response = await axios.patch(`http://localhost:5002/api/food-items/${id}/availability`, {
        availability: newAvailability,
      });
      setMessage(response.data.message);
      fetchFoodItems(); // Refresh the food items list
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manage Food Items</h1>

      {/* Add/Edit Food Item Form */}
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
          {editItemId ? 'Update Food Item' : 'Add Food Item'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Food Items List */}
      <h2>Food Items</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {foodItems.map((item) => (
          <li
            key={item._id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
            }}
          >
            <h3>{item.name}</h3>
            <p>Price: ${item.price}</p>
            <p>Description: {item.description}</p>
            <p>Restaurant: {item.restaurant}</p>
            <p>Availability: {item.availability}</p>
            <button
              onClick={() => handleAvailabilityToggle(item._id, item.availability)}
              style={{
                padding: '5px 10px',
                backgroundColor: item.availability === 'Available' ? '#28a745' : '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              {item.availability === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button
              onClick={() => handleEdit(item)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#ffc107',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FoodItemsPage;