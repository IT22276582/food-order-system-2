import React from 'react';
import { Link, Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Orders from './customernavigationpages/Orders';
import ViewOrders from './customernavigationpages/ViewOrders';
import EditProfile from './customernavigationpages/EditProfile';
import Viewitems from './customernavigationpages/viewitems';
import './styles/customerhom.css';

function CustomerHome() {
  const location = useLocation();
  const navigate = useNavigate();
  let { user } = location.state || {};
  if (!user) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  }

  console.log('CustomerHome user:', user); // Debug user data

  // Redirect to login if no user data
  if (!user || !user.username || !user.email) {
    return <Navigate to="/customerLogin" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/customerLogin');
  };

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>Welcome back, <span className="username">{user.username}</span>!</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <nav className="dashboard-nav">
        <Link to="/customerHome/view-orders" className="nav-link">
          <span className="nav-icon">📋</span>
          <span className="nav-text">My Orders</span>
        </Link>
        <Link to="/customerHome/edit-profile" className="nav-link">
          <span className="nav-icon">👤</span>
          <span className="nav-text">Profile</span>
        </Link>
        <Link to="/customerHome/view-items" className="nav-link">
          <span className="nav-icon">🍽️</span>
          <span className="nav-text">Menu</span>
        </Link>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="/customerHome/view-items" replace />} />
          <Route path="view-orders" element={<ViewOrders user={user} />} />
          <Route path="edit-profile" element={<EditProfile user={user} />} />
          <Route path="view-items" element={<Viewitems user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default CustomerHome;