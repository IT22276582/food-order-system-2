import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAddress: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String },
  foodItem: {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, required: true },
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Assigned', 'Delivered'], default: 'Pending' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  driverName: { type: String, default: null },  // Add this field for storing the driver's name
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;