const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    // Extracting the token from the header
    const token = req.header('Authorization').replace('Bearer ', '');

    console.log("Token:", token);
    const decoded = jwt.verify(token, "secret");
    console.log("Decoded:", decoded);


    // Finding the user based on the token
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
