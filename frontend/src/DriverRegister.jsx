import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/driverregister.css';

function DriverRegister() {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    vehicleType: '',
    availability: 'Available',
    location: '',
  });

  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/drivers', formData);
      alert(response.data.message);
      fetchDrivers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5001/drivers');
      setDrivers(response.data);
    } catch (err) {
      alert('Error fetching drivers: ' + err.message);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/driver-login');
  };

  return (
    <div className="driver-register-container">
      <div className="driver-register-card">
        <h1 className="register-title">Driver Registration</h1>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Driver Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              name="licenseNumber"
              placeholder="Enter license number"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Vehicle Type</label>
            <input
              type="text"
              name="vehicleType"
              placeholder="Enter vehicle type"
              value={formData.vehicleType}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter your location"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <button type="submit" className="submit-button">
            Register Driver
          </button>
        </form>

        <div className="action-buttons">
          <button onClick={fetchDrivers} className="fetch-button">
            Fetch Drivers
          </button>
          
          <button onClick={handleNavigateToLogin} className="login-button">
            Go to Driver Login
          </button>
        </div>

        {drivers.length > 0 && (
          <div className="drivers-list">
            <h2 className="list-title">Registered Drivers</h2>
            <div className="drivers-grid">
              {drivers.map((driver) => (
                <div key={driver._id} className="driver-card">
                  <h3>{driver.name}</h3>
                  <p><strong>License:</strong> {driver.licenseNumber}</p>
                  <p><strong>Vehicle:</strong> {driver.vehicleType}</p>
                  <p><strong>Status:</strong> {driver.availability}</p>
                  <p><strong>Location:</strong> {driver.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverRegister;


