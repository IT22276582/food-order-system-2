import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  orderId: { type: String, unique: true, required: true }, // Unique order ID for notifications
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerPhone: { type: String, required: true }, // For SMS notifications
  customerEmail: { type: String, required: true }, // For email notifications
  foodItems: [
    {
      foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Assigned', 'Delivered'], default: 'Pending' },
  assignedDriver: { type: String }, // Driver name or ID
  driverPhone: { type: String }, // For driver SMS notifications
  estimatedDelivery: { type: String, default: '30 minutes' }, // For notification content
  createdAt: { type: Date, default: Date.now },
});

const Order = model('Order', orderSchema);

export default Order;