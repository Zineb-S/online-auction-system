import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51OglyFI5J9yjRqIR6lTlDLWolFmO4zeZryA1dWwNIVcP6C6tHmL8mW4F6mr9uIwQ8v8NXKyxp7k1HEOipFutgdpp005M7S4Yfm');

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

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      iconColor: '#c4f0ff',
      color: '#000',
      fontWeight: '500',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#fce883' },
      '::placeholder': { color: '#87bbfd' },
      border: '1px solid transparent',
      borderRadius: '4px',
      padding: '10px 12px',
    },
    invalid: {
      iconColor: '#ffc7ee',
      color: '#ffc7ee',
    },
  },
};


const CardForm = ({ onCardComplete }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleCardChange = async (event) => {
    if (!stripe || !elements) {
      return;
    }
    
    if (event.complete) {
      const cardElement = elements.getElement(CardElement);
      const { error, token } = await stripe.createToken(cardElement);
      if (error) {
        console.log('[error]', error);
      } else {
        console.log('[PaymentMethod]', token);
        onCardComplete(token);
      }
    }
  };

  return (
    <CardElement onChange={handleCardChange} />
  );
};



const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    stripeToken: '', // Initialize stripeToken in your state
    // Add other fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSuccessfulToken = (token) => {
    setFormData({ ...formData, stripeToken: token.id });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.stripeToken) {
      alert('Please fill in your card details.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/users/signup', formData);
      console.log('Signup Success:', response.data);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Signup Error:', error.response ? error.response.data : error);
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
        <Elements stripe={stripePromise}>
          <CardForm onCardComplete={handleSuccessfulToken} />
        </Elements>
        <button type="submit" style={buttonStyle}>Signup</button>
      </form>
    </div>
  );
};

export default Signup;