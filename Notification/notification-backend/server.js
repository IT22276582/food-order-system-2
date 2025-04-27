const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/notify', notificationRoutes);

app.listen(config.port, () => {
  console.log(`Notification Service running on port ${config.port}`);
});