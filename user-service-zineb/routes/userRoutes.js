const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const userModel = require('../models/userModel');
const router = express.Router();
const jwt = require('jsonwebtoken');
router.post('/validate-token', async (req, res) => {
    try {
        const token = req.body.token;
        if (!token) {
            throw new Error('Token not provided');
        }
        const decoded = jwt.verify(token, "secret");
        const user = await userModel.findById(decoded.userId).select('-password'); // Exclude sensitive fields

        if (!user) {
            throw new Error('User not found');
        }

        res.json(user); // Send back user details
    } catch (error) {
        console.log('Error validating token:', error.message); // Log the error message
        res.status(401).send({ error: 'Authentication failed' });
    }
});
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/me', auth, userController.getProfile);

// Get all users
router.get('/', userController.getAllUsers);

// Get a single user by id
router.get('/:id', userController.getUserById);

// Create a new user
router.post('/', userController.createUser);

// Update a user by id
router.patch('/:id', userController.updateUserById);

// Delete a user by id
router.delete('/:id', userController.deleteUserById);

module.exports = router;
