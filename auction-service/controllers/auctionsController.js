const Auction = require('../models/Auction');
const amqp = require('amqplib/callback_api');

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
exports.getLiveAuctions = async (req, res) => {
  try {
    const liveAuctions = await Auction.find({ status: 'live' });
    res.json(liveAuctions);
  } catch (error) {
    res.status(500).send("Error fetching live auctions: " + error.message);
  }
};



// Connect to RabbitMQ server
amqp.connect('amqp://localhost', (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }
    const exchange = 'auction_exchange';
    const queue = 'auction_bid_queue'; // Queue name for bid events

    channel.assertExchange(exchange, 'direct', { durable: false });
    channel.assertQueue(queue, { exclusive: false }, (error2, q) => {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s.", queue);

      // Bind queue to exchange with routing key 'bid_placed'
      channel.bindQueue(q.queue, exchange, 'bid_placed');

      // Start consuming messages
      channel.consume(q.queue, (msg) => {
        if (msg.content) {
          const bidEvent = JSON.parse(msg.content.toString());
          console.log(" [x] Received bid event", bidEvent);

          // Handle the bid event (update auction status or highest bid)
          handleBidEvent(bidEvent);
        }
      }, { noAck: true });
    });
  });
});

// Function to handle bid event in auction service
async function handleBidEvent(bidEvent) {
  try {
      const auction = await Auction.findById(bidEvent.auctionId);
      if (!auction) {
          console.error('Auction not found for ID:', bidEvent.auctionId);
          return;
      }

      const newBid = {
          bidder: bidEvent.bidder,
          amount: bidEvent.amount,
          time: new Date(), // Assuming you want to use the server time for the bid
      };

      auction.bids.push(newBid);
      await auction.save();
      console.log(`Auction ${auction._id} updated with new bid.`);

      // If you're using WebSockets to notify clients of the update, do it here
  } catch (error) {
      console.error('Error handling bid event:', error);
  }
}
