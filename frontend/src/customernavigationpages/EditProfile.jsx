import React, { useState } from 'react';
import '../styles/editprofile.css'; // Create this CSS file

function EditProfile() {
  // All existing state and functions remain exactly the same
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Edit Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;