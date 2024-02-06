const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const auctionsRoutes = require('./routes/auctionsRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const schedule = require('node-schedule');
const Auction = require('./models/Auction');
const socketManager = require('./socketManager');

const app = express();
const server = http.createServer(app);
const io = socketManager.init(server); // Make sure this is properly set up to initialize socket.io

app.use(cors());
app.use(express.json());
// Route to get live auctions
app.get('/api/auctions/live', async (req, res) => {
  try {
    const liveAuctions = await Auction.find({ status: 'live' });
    res.json(liveAuctions);
  } catch (error) {
    res.status(500).send({ message: "Error fetching live auctions", error: error.message });
  }
});
app.use('/api/auctions', auctionsRoutes);
app.use('/api/items', itemsRoutes);

// MongoDB connection string
const mongoDBConnectionString = 'mongodb+srv://ynov:ynov@cluster0.qmykuhi.mongodb.net/auctions';



// Function to schedule auction status updates
function scheduleAuctionStatusUpdates() {
  // This will check for auctions to update every 3 seconds
  schedule.scheduleJob('*/3 * * * * *', async function() {
    const now = new Date();
    const auctionsToUpdate = await Auction.find({
      $or: [
        { startTime: { $lte: now }, status: 'scheduled' },
        { endTime: { $lte: now }, status: 'live' }
      ]
    });

    auctionsToUpdate.forEach(async auction => {
      if (auction.startTime <= now && auction.status === 'scheduled') {
        auction.status = 'live';
      } else if (auction.endTime <= now && auction.status === 'live') {
        auction.status = 'ended';
      }
      await auction.save();
      io.emit('auctionStatusChange', { auctionId: auction._id, status: auction.status });
    });
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Add more socket event handlers as needed
});


 mongoose.connect(mongoDBConnectionString)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(3003, () => {
      console.log(`Server running on port 3003`);
      scheduleAuctionStatusUpdates();
    });
  })
  .catch((error) => console.error('MongoDB connection error:', error));