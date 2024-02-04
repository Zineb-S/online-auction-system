const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], // Reference to Item model
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, required: true, enum: ['scheduled', 'live', 'ended'] },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model, optional initially
  bids: [{
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    time: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Auction', auctionSchema);
