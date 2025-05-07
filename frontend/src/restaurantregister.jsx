import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/restaurantregister.css';

function RestaurantRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/restaurants/register', formData);
      setMessage(response.data.message);
      navigate('/restaurant-login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/restaurant-login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Register Your Restaurant</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Restaurant Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter restaurant name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="register-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <button onClick={handleLogin} className="login-button">
          Already have an account? Login
        </button>
        {message && (
          <p className={message.includes('error') ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default RestaurantRegister;