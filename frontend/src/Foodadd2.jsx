import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/foodadd.css';

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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/food-items', formData);
      setMessage(response.data.message);
      setFormData({ 
        name: '', 
        price: '', 
        description: '', 
        restaurant: formData.restaurant, 
        address: formData.address, 
        availability: 'Available' 
      });
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="food-add-container">
      <div className="food-add-card">
        <div className="food-add-header">
          <h1>Add New Menu Item</h1>
          <p className="food-add-subtitle">Fill in the details to add a new food item to your menu</p>
        </div>

        <form onSubmit={handleSubmit} className="food-add-form">
          <div className="form-group">
            <label htmlFor="name">Food Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter food name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              required
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="restaurant">Restaurant Name</label>
            <input
              type="text"
              id="restaurant"
              name="restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              required
              className="form-input disabled"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Restaurant Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-input disabled"
              disabled
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Adding...
              </>
            ) : (
              'Add Food Item'
            )}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodAdd2Page;