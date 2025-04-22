import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt


const restaurantSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
restaurantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
restaurantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Restaurant = model('Restaurant', restaurantSchema);

export default Restaurant;