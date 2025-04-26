import React, { useState } from 'react';
import axios from 'axios';
import { Navigate , useNavigate, useLocation} from 'react-router-dom';


function CustomerLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', formData);
      const userData = response.data; // userData is the full user object
      setMessage('Login successful!');
      console.log(response.data); 
      localStorage.setItem('user', JSON.stringify(userData)); // ✅ Save to localStorage

      navigate("/customerHome", { state: { user: userData } });
      
    } catch (err) {
      setMessage(err.response?.data || 'Login failed');
    }
  };
  const handleregisternavigation = () => {
    navigate("/customerRegister")
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Customer Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </form>
      <button
          onClick={handleregisternavigation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          register
        </button>
      {message && <p style={{ marginTop: '10px', color: 'red' }}>{message}</p>}
    </div>
  );
}

export default CustomerLogin;