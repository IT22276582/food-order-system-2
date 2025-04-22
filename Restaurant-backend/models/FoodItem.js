import { Schema, model } from 'mongoose';

const foodItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  restaurant: { type: String, required: true }, // Restaurant name or ID
  createdAt: { type: Date, default: Date.now },
  availability: { 
    type: String, 
    required: true, 
    enum: ['Available', 'Unavailable'], 
    default: 'Available' 
  },
});

const FoodItem = model('FoodItem', foodItemSchema);

export default FoodItem;