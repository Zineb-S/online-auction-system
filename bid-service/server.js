const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Adjust according to your needs
});

// Pass 'io' to your routes here, after 'io' is defined
const bidRoutes = require('./routes/bidRoutes')(io);

app.use(cors());
app.use(express.json());
app.use('/api/bids', bidRoutes);

mongoose.connect('mongodb+srv://ynov:ynov@cluster0.qmykuhi.mongodb.net/bids')
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(process.env.PORT || 3004, () => console.log(`Bid Service running on port ${process.env.PORT || 3004}`));
})
.catch((error) => console.error(error));

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});
