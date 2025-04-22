import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  foodItems: [
    {
      foodId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Assigned', 'Delivered'], default: 'Pending' },
  assignedDriver: { type: String }, // Driver name or ID
  createdAt: { type: Date, default: Date.now },
});

const Order = model('Order', orderSchema);

export default Order;