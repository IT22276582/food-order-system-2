import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // Reference to Restaurant
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
  assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver' }, // Reference to Driver
  createdAt: { type: Date, default: Date.now },
});

const Order = model('Order', orderSchema);

export default Order;