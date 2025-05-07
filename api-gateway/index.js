const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Proxy configurations for each service
const services = [
  {
    route: '/drivers',
    target: 'http://driver-register-backend:5001',
  },
  {
    route: '/auth',
    target: 'http://login-backend:5000',
  },
  {
    route: '/notifications',
    target: 'http://notification-backend:3003',
  },
  {
    route: '/orders',
    target: 'http://order-service:5004',
  },
  {
    route: '/payments',
    target: 'http://payment-service:5005',
  },
  {
    route: '/restaurants',
    target: 'http://restaurant-backend:5002',
  },
];

// Set up proxy middleware for each service
services.forEach(({ route, target }) => {
  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${route}`]: '' }, // Remove the route prefix when forwarding
      onError: (err, req, res) => {
        console.error(`Error proxying to ${target}:`, err.message);
        res.status(500).json({ error: 'Service unavailable' });
      },
    })
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});