import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function FoodHome() {
  return (
    <div className="home-container">
      <h1>Welcome to the Registration Portal</h1>
      <div className="navigation-buttons">
        <Link to="/driver-register" className="nav-button">Driver Register</Link>
        <Link to="/login" className="nav-button">Customer Register</Link>
        <Link to="/restaurant-register" className="nav-button">restaurant Register</Link>
      </div>
    </div>
  );
}

export default FoodHome;