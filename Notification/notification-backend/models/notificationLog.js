const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  type: { type: String, enum: [' SMS', 'email'], required: true },
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);