import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function DriversHomePage() {
  const [driver, setDriver] = useState(null);
  const [message, setMessage] = useState('');
  const [newLocation, setNewLocation] = useState(''); // State for updating location
  const location = useLocation();
  const driverId = location.state?.driverId; // Get driverId from React Router state

  // Fetch driver details
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

  // Toggle availability
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

  // Update location
  const updateLocation = async () => {
    try {
      const response = await axios.patch(`http://localhost:5001/drivers/${driverId}`, {
        location: newLocation,
      });
      setDriver(response.data.driver);
      setMessage('Location updated successfully');
    } catch (err) {
      console.error('Error updating location:', err.message);
      setMessage('Failed to update location');
    }
  };

  if (!driverId) {
    return <p>{message}</p>;
  }

  if (!driver) {
    return <p>Loading driver details...</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome, {driver.name}</h1>
      <p>License Number: {driver.licenseNumber}</p>
      <p>Vehicle Type: {driver.vehicleType}</p>
      <p>Current Availability: <strong>{driver.availability}</strong></p>
      <p>Current Location: <strong>{driver.location}</strong></p>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter new location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
        />
        <button
          onClick={updateLocation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Update Location
        </button>
      </div>
      <button
        onClick={toggleAvailability}
        style={{
          padding: '10px 20px',
          backgroundColor: driver.availability === 'Available' ? '#dc3545' : '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Set as {driver.availability === 'Available' ? 'Unavailable' : 'Available'}
      </button>
      {message && <p style={{ marginTop: '20px', color: 'green' }}>{message}</p>}
    </div>
  );
}

export default DriversHomePage;