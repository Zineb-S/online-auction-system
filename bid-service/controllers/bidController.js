module.exports = function(io) {const axios = require('axios');
const Bid = require('../models/Bid');
const amqp = require('amqplib/callback_api');
const USER_SERVICE_URL = 'http://localhost:3001/api/users/';

// Global channel for RabbitMQ
let amqpChannel = null;

// Initialize RabbitMQ connection and channel
function initRabbitMQ() {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      console.error('Failed to connect to RabbitMQ', error0);
      // Retry after a delay
      setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
      return;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = 'auction_exchange';
      channel.assertExchange(exchange, 'direct', { durable: false });
      amqpChannel = channel;
      console.log("RabbitMQ Channel created successfully");
    });
  });
}

// Call initRabbitMQ when the application starts
initRabbitMQ();

// Helper function to publish bid event to RabbitMQ
async function publishBidEvent(bidDetails) {
  if (!amqpChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  const exchange = 'auction_exchange';
  // Using 'direct' exchange, routing key is 'bid_placed'
  amqpChannel.publish(exchange, 'bid_placed', Buffer.from(JSON.stringify(bidDetails)));
  console.log("Published bid event to RabbitMQ:", bidDetails);
}

// Function to fetch user details
const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for user ID ${userId}:`, error);
    return null;
  }
};

const placeBid = async (req, res) => {
  try {
    console.log(req.body);
    const { auctionId, amount, item } = req.body; // Ensure you're destructuring item here as well
    const bidder = req.user._id;

    // Correctly include item when creating a new Bid
    const newBid = new Bid({ item, bidder, amount }); // Ensure item is included
    await newBid.save();

    const userDetails = await fetchUserDetails(bidder);

    // Publish event with auctionId but do not save auctionId in the Bid model
    await publishBidEvent({
        item,
        auctionId, // Send along auctionId for the auction service to use
        bidder,
        amount,
        userDetails,
    }); 
    io.emit('bidPlaced', { itemId: item, amount });
    res.status(201).json(newBid);
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).send(error.message);
  }
};
// View all bids for an item
const viewBids = async (req, res) => {
  try {
    const { itemId } = req.params;
    let bids = await Bid.find({ item: itemId }).sort('-amount');

    // Fetch user details for each bid
    const bidsWithUserDetails = await Promise.all(bids.map(async (bid) => {
      // Fetch user details for the bidder
      const userDetails = await fetchUserDetails(bid.bidder);
      // If userDetails is null, it means there was an error fetching it
      if (userDetails) {
        // Combine bid information with user details
        return { ...bid.toObject(), userDetails };
      } else {
        // If user details could not be fetched, return bid without user details
        return bid.toObject();
      }
    }));

    res.json(bidsWithUserDetails);
  } catch (error) {
    console.error("Error fetching bids for item:", itemId, error);
    res.status(500).send(error.message);
  }
};
// Get winning bid
const getWinningBid = async (req, res) => {
  try {
    const item  = req.params.itemId;
    const winningBid = await Bid.findOne({ item }).sort('-amount');
    if (!winningBid) {
      return res.status(404).send('No bids found');
    }
    const userDetails = await fetchUserDetails(winningBid.bidder);
    const winningBidWithUserDetails = { ...winningBid.toObject(), userDetails };
    res.json(winningBidWithUserDetails);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
// Get all bids
const getAllBids = async (req, res) => {
    try {
      const bids = await Bid.find({});
      console.log("All Bids found:", bids);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching all bids:", error.message);
      res.status(500).send(error.message);
    }
  };

// Fetch bids made by the authenticated user
const getUserBids = async (req, res) => {
  try {
    // req.user is set by your authenticate middleware
    const userId = req.user._id;
    const userBids = await Bid.find({ bidder: userId });
    res.json(userBids);
  } catch (error) {
    console.error(`Error fetching user bids: ${error}`);
    res.status(500).send({ message: "Error fetching user bids", error: error.message });
  }
};

return {
  placeBid,viewBids,getWinningBid,getAllBids,getUserBids
  // other functions
};
}