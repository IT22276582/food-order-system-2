import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String },
  foodItem: {
    foodId: { type: mongoose.Schema.Types.ObjectId, required: true }, // No ref to FoodItem
    quantity: { type: Number, required: true },
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Delivered'], default: 'Pending' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, default: null },
  driverName: { type: String, default: null },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;