import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/customerlogin.css';

function CustomerLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      const response = await axios.post('http://localhost:5000/login', formData);
      const userData = response.data;
      setMessage('Login successful!');
      localStorage.setItem('user', JSON.stringify(userData));
      navigate("/customerHome", { state: { user: userData } });
    } catch (err) {
      setMessage(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNavigation = () => {
    navigate("/customerRegister");
  };

  return (
    <div className="customer-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Customer Login</h1>
          <p className="login-subtitle">Welcome back! Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
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
          <p>Don't have an account? <span className="register-link" onClick={handleRegisterNavigation}>Register here</span></p>
          <p className="forgot-password">Forgot password? <span className="reset-link">Reset it</span></p>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;