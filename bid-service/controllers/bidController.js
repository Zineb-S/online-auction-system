const axios = require('axios');
const Bid = require('../models/Bid');
const USER_SERVICE_URL = 'http://localhost:3001/api/users/'; // Your User service URL

// Helper function to fetch user details
const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for user ID ${userId}:`, error.response?.data || error.message);
    return null;
  }
};

// Place a bid
exports.placeBid = async (req, res) => {
  try {
    const bidder = req.user._id; // Assuming this is set by your authentication middleware
    const { item, amount } = req.body;
    const newBid = new Bid({ item, bidder, amount });
    await newBid.save();
    const userDetails = await fetchUserDetails(bidder);
    const bidWithUserDetails = { ...newBid.toObject(), userDetails };
    res.status(201).json(bidWithUserDetails);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// View all bids for an item
exports.viewBids = async (req, res) => {
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
exports.getWinningBid = async (req, res) => {
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
exports.getAllBids = async (req, res) => {
    try {
      const bids = await Bid.find({});
      console.log("All Bids found:", bids);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching all bids:", error.message);
      res.status(500).send(error.message);
    }
  };
  