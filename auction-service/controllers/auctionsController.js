const Auction = require('../models/Auction');

// Get all auctions
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get an auction by ID including item details
exports.getAuctionById = async (req, res) => {
  try {
    // Using populate to fetch item details associated with the auction
    const auction = await Auction.findById(req.params.id)
      .populate('items') // Assuming 'items' field is an array of ObjectIds referencing the 'Item' model
      

    if (!auction) return res.status(404).send('Auction not found');
    res.json(auction);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// Create a new auction
exports.createAuction = async (req, res) => {
  try {
    const auction = new Auction(req.body);
    await auction.save();
    res.status(201).json(auction);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update an auction
exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!auction) return res.status(404).send('Auction not found');
    res.json(auction);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete an auction
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);
    if (!auction) return res.status(404).send('Auction not found');
    res.send('Auction deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};
