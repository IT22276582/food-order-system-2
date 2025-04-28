import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/customerregistration.css';

function CustomerRegister() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
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
      const response = await axios.post('http://localhost:5000/register', formData);
      setMessage('Registration successful!');
      console.log(response.data);
      navigate('/customerlogin'); // Redirect to login after successful registration
    } catch (err) {
      setMessage(err.response?.data || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNavigation = () => {
    navigate('/customerlogin');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Customer Registration</h1>
        <p className="register-subtitle">Create your account to start ordering</p>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              value={formData.username}
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
          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message && (
          <p className={message.includes('failed') ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <span className="login-link" onClick={handleRegisterNavigation}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerRegister;