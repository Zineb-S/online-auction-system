const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes'); // Make sure you have this file created
const cors = require('cors');
// Connect to MongoDB
mongoose.connect('mongodb+srv://ynov:ynov@cluster0.qmykuhi.mongodb.net/users')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Could not connect to MongoDB', err));

// Initialize Express app
const app = express();
app.use(cors()); // This will allow all origins
// Middlewares
app.use(express.json()); // for parsing application/json

// Define a simple route to check if server is running
app.get('/', (req, res) => {
  res.send('User Service is running...');
});

// User routes
app.use('/api/users', userRoutes); // Use the user routes for any /api/users path
app.get('/test', (req, res) => {
  res.send('Test endpoint response');
})
// Start the server
const PORT = process.env.PORT || 3002; // Use the environment variable PORT or 3000 as default
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
