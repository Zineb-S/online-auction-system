const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

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
