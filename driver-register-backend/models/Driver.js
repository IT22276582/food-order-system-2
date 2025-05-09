import mongoose from 'mongoose';

// Define Driver schema
const driverSchema = new mongoose.Schema({
  name: String,
  licenseNumber: {type:String, required: true, unique: true}, // License number as a string
  vehicleType: String,
  availability: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available',
  },
  location: {
    type: String, // Location as a simple name
    required: true, // Make it mandatory
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  }, 
  password: {
    type: String,
    required: true,
  }
});

// Create and export the Driver model
const Driver = mongoose.model('Driver', driverSchema);
export default Driver;