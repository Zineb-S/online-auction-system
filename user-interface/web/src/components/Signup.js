import React, { useState } from 'react';
import axios from 'axios';

// Define the styles
const formStyle = {
  maxWidth: '400px',
  margin: '50px auto',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  background: '#fff'
};

const inputStyle = {
  width: '100%',
  padding: '10px 15px',
  margin: '10px 0',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxSizing: 'border-box' // Added for consistent sizing with padding
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

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    // Add other fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/users/signup', formData);
      console.log('Signup Success:', response.data);
      localStorage.setItem('token', response.data.token); // Save token to localStorage
      // Redirect to another page or show success message
    } catch (error) {
      console.error('Signup Error:', error.response.data);
    }
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: 'center' }} >Signup</h2>
      <form onSubmit={handleSubmit}>
        <input 
          name="firstName" 
          type="text" 
          placeholder="First Name" 
          value={formData.firstName} 
          onChange={handleChange} 
          required 
          style={inputStyle} 
        />
        {/* Repeat for other fields with style={inputStyle} */}
        <input 
          name="lastName" 
          type="text" 
          placeholder="Last Name" 
          value={formData.lastName} 
          onChange={handleChange} 
          required 
          style={inputStyle} 
        />
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={inputStyle} 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          style={inputStyle} 
        />
        <input 
          name="phoneNumber" 
          type="text" 
          placeholder="Phone Number" 
          value={formData.phoneNumber} 
          onChange={handleChange} 
          style={inputStyle} 
        />
        <button type="submit" style={buttonStyle}>Signup</button>
      </form>
    </div>
  );
};

export default Signup;
