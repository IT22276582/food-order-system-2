import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function FoodHome() {
  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome to FoodExpress</h1>
        <p className="welcome-subtitle">Join our platform as:</p>
        
        <div className="role-cards">
          <Link to="/driver-register" className="role-card driver-card">
            <div className="card-icon">🚚</div>
            <h3>Driver</h3>
            <p>Deliver food and earn money</p>
            <div className="card-button">Register as Driver</div>
          </Link>
          
          <Link to="/customerlogin" className="role-card customer-card">
            <div className="card-icon">🍽️</div>
            <h3>Customer</h3>
            <p>Order from your favorite restaurants</p>
            <div className="card-button">Register as Customer</div>
          </Link>
          
          <Link to="/restaurant-register" className="role-card restaurant-card">
            <div className="card-icon">🏪</div>
            <h3>Restaurant</h3>
            <p>Reach more customers</p>
            <div className="card-button">Register Restaurant</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FoodHome;