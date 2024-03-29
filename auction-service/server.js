const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const auctionsRoutes = require('./routes/auctionsRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const schedule = require('node-schedule');
const Auction = require('./models/Auction');
const socketManager = require('./socketManager');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51OglyFI5J9yjRqIR1za00VVy67hGuu3RTTKCUB0Gj8VUTTICAH61o2xS19Y7oaOYPYNBWorPbKbsu2cKlI50NiAB00MZjs5WyF');
const axios = require('axios');
const app = express();
const server = http.createServer(app);
const io = socketManager.init(server);

const Mailjet = require('node-mailjet');
const mailjet = new Mailjet({
  apiKey: 'c8f78af8ba5c6611d4fbdfc246473ab3',
  apiSecret: '8b234d04b6a4fc2c551ed7cfcbde2821'
});

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
async function sendEmail(toEmail, subject, textContent, htmlContent) {
  try {
    const request = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'zineb.selmouni@ynov.com',
            Name: 'Bex Technologies'
          },
          To: [
            {
              Email: toEmail
            }
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
          TemplateID: 5674130,
          TemplateLanguage: true,
          
        }
      ]
    });
    console.log(request.body);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
const processPaymentForWinningBid = async (itemId, auctionId) => {
  
    const response = await axios.post('http://localhost:3001/api/users/login', {
      email: "zineb@selmouni.ma",
      password: "zineb123"
});
    const globalAuthToken = response.data.token; 
  try {
    
    const winningBidResponse = await axios.get(`http://localhost:3001/api/bids/winning/${itemId}`, {
      headers: { Authorization: `Bearer ${globalAuthToken}` }
    });
    const winningBid = winningBidResponse.data;
    const amount =winningBid.amount;
    const customer = winningBid.userDetails.stripeCustomerId;
    console.log(amount,customer)
    const winningBidPayment = await axios.post(`http://localhost:3001/api/users/charge`,{ amount:amount , stripeCustomerId: customer}, {
      headers: { Authorization: `Bearer ${globalAuthToken}` }
    });
   
    console.log(winningBidPayment.data.success)
    if (winningBidPayment.data.success) {
      // Email content
      const emailSubject = 'Congratulations on Winning the Auction!';
      const emailTextContent = `Dear ${winningBid.userDetails.firstName}, congratulations on winning the auction for item ID ${itemId}.`;
      const emailHtmlContent = `<p>Dear ${winningBid.userDetails.firstName},</p><p>Congratulations on winning the auction for item ID ${itemId}.</p>`;
  
      // Send email
      await sendEmail(
        "zselmouni123@gmail.com",
        emailSubject,
        emailTextContent,
        emailHtmlContent
      )}
  } catch (error) {
    console.error(`Error processing payment for item ${itemId}:`, error);
  }
};

function scheduleAuctionStatusUpdates() {
  schedule.scheduleJob('*/3 * * * * *', async function() {
    const now = new Date();
    const auctionsToUpdate = await Auction.find({
      $or: [
        { startTime: { $lte: now }, status: 'scheduled' },
        { endTime: { $lte: now }, status: 'live' }
      ]
    });

    for (const auction of auctionsToUpdate) {
      if (auction.startTime <= now && auction.status === 'scheduled') {
        auction.status = 'live';
      } else if (auction.endTime <= now && auction.status === 'live') {
        auction.status = 'ended';
        // Handle payment for each item's winning bid in the ended auction
        for (const item of auction.items) {
          await processPaymentForWinningBid(item._id, auction._id);
        }
      }
      await auction.save();
      io.emit('auctionStatusChange', { auctionId: auction._id, status: auction.status });
    }
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