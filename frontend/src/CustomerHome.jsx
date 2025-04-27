import React from 'react';
import { Link, Route, Routes,useLocation } from 'react-router-dom';
import Orders from './customernavigationpages/Orders';
import ViewOrders from './customernavigationpages/ViewOrders';
import EditProfile from './customernavigationpages/EditProfile';
import Viewitems from './customernavigationpages/viewitems';



function CustomerHome() {
    const location = useLocation();
    let { user } = location.state || {};
    if (!user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      }
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Welcome, {user?.username || "Guest"}!</h1>
    <p>Email: {user?.email || "No Email Available"}</p>
      {/* Navigation Bar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          backgroundColor: '#007bff',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <Link
          to="/customerHome/orders"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Orders
        </Link>
        <Link
          to="/customerHome/view-orders"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          View Orders
        </Link>
        <Link
          to="/customerHome/edit-profile"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Edit Profile
        </Link>
        
        <Link
          to="/customerHome/view-items"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          View-items
        </Link>
      </nav>

      {/* Routes */}
      <div style={{ marginTop: '20px' }}>
        <Routes>
          <Route path="orders" element={<Orders user={user} />} />
          <Route path="view-orders" element={<ViewOrders user={user} />} />
          <Route path="edit-profile" element={<EditProfile user={user} />} />
          <Route path="view-items" element={<Viewitems user={user} />} />

        </Routes>
      </div>
    </div>
  );
}

export default CustomerHome;