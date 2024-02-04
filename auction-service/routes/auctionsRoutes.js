const express = require('express');
const auctionsController = require('../controllers/auctionsController');
const router = express.Router();

router.get('/', auctionsController.getAllAuctions);
router.get('/:id', auctionsController.getAuctionById);
router.get('/live', auctionsController.getLiveAuctions);
router.post('/', auctionsController.createAuction);
router.put('/:id', auctionsController.updateAuction);
router.delete('/:id', auctionsController.deleteAuction);

module.exports = router;
