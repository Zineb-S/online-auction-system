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
      console.log(`[Proxy] Request to: ${req.path}`);
      console.log(`[Proxy] Forwarding to: ${process.env.USER_SERVICE_URL}${req.path}`);
      // Log the request headers
      console.log(`[Proxy] Request Headers: `, proxyReq.getHeaders());
      console.log('[Proxy] Request Body:', req.body);
  },
  
  onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy] Received response for: ${req.path}`);
      // Log the status code of the proxied request's response
      console.log(`[Proxy] Response Status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
      console.log(`[Proxy] Error occurred while proxying: ${req.path}`);
      console.log(err);
  }
}));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
