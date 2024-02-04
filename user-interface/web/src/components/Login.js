import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify';
const loginStyle = {
  maxWidth: '400px',
  margin: '50px auto',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  background: '#fff'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  border: '1px solid #ddd',
  borderRadius: '5px'
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  border: 'none',
  backgroundColor: '#5CDB95',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px'
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', { email, password });
      console.log('Login Success:', response.data);
      localStorage.setItem('token', response.data.token); // Save token to localStorage
      toast.success('Logged in successfully'); // Display success toast
      navigate('/auctions'); // Redirect to /auctions
    } catch (error) {
      console.error('Login Error:', error.response?.data || 'An unknown error occurred');
      toast.error('Login failed. Please check your credentials.'); // Display error toast
    }
  };

  return (
    <div style={loginStyle}>
      <ToastContainer />
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
};

export default Login;
