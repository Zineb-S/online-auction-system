const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bidRoutes = require('./routes/bidRoutes');

const app = express();
const PORT = process.env.PORT || 3004; 

app.use(cors());
app.use(express.json());
app.use('/api/bids', bidRoutes);

mongoose.connect('mongodb+srv://ynov:ynov@cluster0.qmykuhi.mongodb.net/bids')
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Bid Service running on port ${PORT}`));
})
.catch((error) => console.error(error));

