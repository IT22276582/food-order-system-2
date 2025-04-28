import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/driverhome.css';

function DriversHomePage() {
  const [driver, setDriver] = useState(null);
  const [message, setMessage] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const location = useLocation();
  const driverId = location.state?.driverId;
  const navigate = useNavigate();

  useEffect(() => {
    if (!driverId) {
      setMessage('Driver ID is missing. Please log in again.');
      return;
    }

    const fetchDriver = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/drivers/${driverId}`);
        setDriver(response.data);
      } catch (err) {
        console.error('Error fetching driver details:', err.message);
        setMessage('Failed to fetch driver details.');
      }
    };

    fetchDriver();
  }, [driverId]);

  const toggleAvailability = async () => {
    try {
      const newAvailability = driver.availability === 'Available' ? 'Unavailable' : 'Available';
      const response = await axios.patch(`http://localhost:5001/drivers/${driverId}`, {
        availability: newAvailability,
      });
      setDriver(response.data.driver);
      setMessage(response.data.message);
    } catch (err) {
      console.error('Error updating availability:', err.message);
      setMessage('Failed to update availability');
    }
  };

  const handleOrders = () => {
    navigate('/driverorder');
  };

  const updateLocation = async () => {
    try {
      const response = await axios.patch(`http://localhost:5001/drivers/${driverId}`, {
        location: newLocation,
      });
      setDriver(response.data.driver);
      setMessage('Location updated successfully');
      setNewLocation('');
    } catch (err) {
      console.error('Error updating location:', err.message);
      setMessage('Failed to update location');
    }
  };

  if (!driverId) {
    return <div className="error-message">{message}</div>;
  }

  if (!driver) {
    return <div className="loading-message">Loading driver details...</div>;
  }

  return (
    <div className="driver-dashboard">
      <div className="driver-profile-card">
        <h1 className="welcome-title">Welcome, {driver.name}!</h1>
        
        <div className="driver-info">
          <div className="info-item">
            <span className="info-label">License Number:</span>
            <span className="info-value">{driver.licenseNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Vehicle Type:</span>
            <span className="info-value">{driver.vehicleType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Status:</span>
            <span className={`status-badge ${driver.availability.toLowerCase()}`}>
              {driver.availability}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Location:</span>
            <span className="info-value">{driver.location || 'Not specified'}</span>
          </div>
        </div>

        <div className="action-section">
          <div className="location-update">
            <h3>Update Your Location</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter new location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="location-input"
              />
              <button onClick={updateLocation} className="update-button">
                Update Location
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={toggleAvailability}
              className={`availability-toggle ${driver.availability.toLowerCase()}`}
            >
              {driver.availability === 'Available' ? 'Go Offline' : 'Go Online'}
            </button>
            <button onClick={handleOrders} className="orders-button">
              View Orders
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriversHomePage;