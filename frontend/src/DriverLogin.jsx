import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      navigate('/driver-home', { state: { driverId: response.data.driver._id } }); // Pass driverId to DriversHomePage
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Driver Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="licenseNumber"
            placeholder="License Number"
            value={formData.licenseNumber}
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
          Login
        </button>
      </form>
      {message && <p style={{ color: 'red', marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

export default DriverLogin;