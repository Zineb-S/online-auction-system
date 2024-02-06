const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv').config();


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log(process.env.STRIPE_SECRET_KEY); // This should print your secret key. If not, it's not being loaded correctly.

exports.signup = async (req, res) => {
  try {
    // Create a new user instance with the request body
    const user = new User(req.body);

    // Create a Stripe customer object for the new user
    const customer = await stripe.customers.create({
      email: user.email,
      // You can include additional information here if needed
    });

    // Save the Stripe customer ID to your user model
    user.stripeCustomerId = customer.id;

    // Save the user to the database
    await user.save();

    // Create a payment method using the token provided in the request
    // Assuming the front end sends the payment token as 'stripeToken'
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: req.body.stripeToken },
    });

    // Attach the payment method to the Stripe customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Create a JWT for the user
    const token = jwt.sign({ userId: user._id }, "secret");

    // Prepare the user object to return, removing sensitive data
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.stripeCustomerId; // Do not send Stripe customer ID to the client

    // Send the user data and token as the response
    res.status(201).send({ user: userObject, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      throw new Error('Unable to login');
    }
    const token = jwt.sign({ userId: user._id }, "secret");

    const userObject = user.toObject();
    delete userObject.password;

    res.send({ user: userObject, token });
  } catch (error) {
    res.status(400).send(error);
  }
};


// Add other CRUD operations here

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send('User deleted successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getProfile = async (req, res) => {
  res.send(req.user);
};

// Add a method to charge the customer
exports.createCharge = async (req, res) => {
  try {
    // Retrieve the customer from Stripe
    const customer = await stripe.customers.retrieve(req.body.stripeCustomerId);

    // Extract the default payment method ID
    const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
    console.log(defaultPaymentMethodId);

    if (!defaultPaymentMethodId) {
      return res.status(400).send({ message: "No default payment method found for the customer." });
    }

    // Create and confirm the PaymentIntent using the default payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      customer: req.body.stripeCustomerId,
      payment_method: defaultPaymentMethodId, // Use the retrieved default payment method
      confirm: true,
      return_url: 'http://example.com/return',
    });


    // Send the success status based on the confirmed PaymentIntent's status
    res.send({ success: paymentIntent.status === 'succeeded' });
  } catch (error) {
    console.error(error); // Log the full error
    res.status(400).send({ message: error.message }); // Send back the error message
  }
};
