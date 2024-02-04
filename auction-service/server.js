const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auctionsRoutes = require('./routes/auctionsRoutes');
const itemsRoutes = require('./routes/itemsRoutes');

const app = express();
const PORT = process.env.PORT || 3003; // Setting port to 3003

app.use(cors());
app.use(express.json());
app.use('/api/auctions', auctionsRoutes);
app.use('/api/items', itemsRoutes);

// MongoDB connection and server start logic
mongoose.connect('mongodb+srv://ynov:ynov@cluster0.qmykuhi.mongodb.net/auctions')
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => console.error(error));
