import { Schema, model, Types } from 'mongoose';

const foodItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  restaurant: { type: Types.ObjectId, ref: 'Restaurant', required: true },
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