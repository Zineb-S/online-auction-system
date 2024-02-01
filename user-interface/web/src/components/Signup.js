import React, { useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        {/* Repeat similar structure for other fields */}
        <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input name="phoneNumber" type="text" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
