import { Schema, model } from 'mongoose';

const notificationLogSchema = new Schema({
  type: { type: String, enum: [' SMS', 'email'], required: true },
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('NotificationLog', notificationLogSchema);