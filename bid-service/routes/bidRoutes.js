const express = require('express');
const bidController = require('../controllers/bidController');
const authenticate = require('../middleware/auth'); // Ensure you import the authentication middleware
const router = express.Router();

// This route should come before any '/:param' routes
router.get('/all', authenticate, bidController.getAllBids); // Get all bids
router.post('/', authenticate, bidController.placeBid); // Place a bid
router.get('/:itemId', authenticate, (req, res) => {
    console.log("Received itemId:", req.params.itemId);
    bidController.viewBids(req, res);
  });
  router.get('/winning/:itemId', authenticate, bidController.getWinningBid); // Get the winning bid for an item
module.exports = router;
