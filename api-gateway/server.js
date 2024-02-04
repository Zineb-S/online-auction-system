const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Proxy setup
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL, // Target host of user service
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.from(bodyData).length);
      proxyReq.write(bodyData);
    }
  },
}));
// Proxy setup
app.use('/api/items', createProxyMiddleware({
  target: process.env.AUCTION_SERVICE_URL, // Target host of user service
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.from(bodyData).length);
      proxyReq.write(bodyData);
    }
  },
}));
// Proxy setup
app.use('/api/auctions', createProxyMiddleware({
  target: process.env.AUCTION_SERVICE_URL, // Target host of user service
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.from(bodyData).length);
      proxyReq.write(bodyData);
    }
  },
}));
app.use('/api/bids', createProxyMiddleware({
  target: process.env.BID_SERVICE_URL, 
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Forward the Authorization header
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.from(bodyData).length);
      proxyReq.write(bodyData);
    }
    
  },
  
}));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
