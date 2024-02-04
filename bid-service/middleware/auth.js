const axios = require('axios');
const USER_SERVICE_URL = 'http://localhost:3002/api/users/validate-token'; // Adjust according to your setup

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const response = await axios.post(USER_SERVICE_URL, { token });

    // Assuming the user service returns the user object on successful validation
    req.user = response.data;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = authenticate;
