import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/driverlogin.css'

function DriverLogin() {
  const [formData, setFormData] = useState({
    licenseNumber: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/drivers/login', formData);
      alert('Login successful!');
      navigate('/driver-home', { state: { driverId: response.data.driver._id } });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Driver Login</h1>
          <p className="login-subtitle">Enter your license number to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="licenseNumber" className="input-label">License Number</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              placeholder="Enter your license number"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="login-footer">
          <p>Don't have an account? <span className="register-link" onClick={() => navigate('/driver-register')}>Register here</span></p>
        </div>
      </div>
    </div>
  );
}

export default DriverLogin;