import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

function DriverRegister() {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    vehicleType: '',
    availability: 'Available', // Default value for availability
  });

  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate(); // Initialize navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/drivers', formData);
      alert(response.data.message);
      fetchDrivers(); // Refresh the driver list
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
    navigate('/driver-login'); // Navigate to the Driver Login page
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Driver Registration</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Driver Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="licenseNumber"
            placeholder="License Number"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="vehicleType"
            placeholder="Vehicle Type"
            value={formData.vehicleType}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
        <button type="submit">Register Driver</button>
      </form>

      <button onClick={fetchDrivers}>Fetch Drivers</button>

      <h2>Registered Drivers</h2>
      <ul>
        {drivers.map((driver) => (
          <li key={driver._id}>
            {driver.name} - {driver.licenseNumber} - {driver.vehicleType} - {driver.availability}
          </li>
        ))}
      </ul>

      <button
        onClick={handleNavigateToLogin}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Go to Driver Login
      </button>
    </div>
  );
}

export default DriverRegister;