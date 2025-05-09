import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/retaurantlogin.css';

function RestaurantLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/restaurants/login', formData);
      const restaurantData = response.data.restaurant;
      const token = response.data.token;
      setMessage('Login successful!');
      
      sessionStorage.setItem('restaurant', JSON.stringify(restaurantData));
      sessionStorage.setItem('token', token);

      navigate('/food-items', { state: { restaurantId: restaurantData._id } });
    } catch (err) {
      setMessage(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Restaurant Login</h1>
          <p className="login-subtitle">Welcome back to your restaurant dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your restaurant email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="login-footer">
          <p>Don't have an account? <span className="register-link" onClick={() => navigate('/restaurant-register')}>Register here</span></p>
          <p className="forgot-password">Forgot password? <span className="reset-link">Reset it</span></p>
        </div>
      </div>
    </div>
  );
}

export default RestaurantLogin;