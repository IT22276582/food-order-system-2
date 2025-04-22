import mongoose from 'mongoose';

// Define Driver schema
const driverSchema = new mongoose.Schema({
  name: String,
  licenseNumber: String,
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
});

// Create and export the Driver model
const Driver = mongoose.model('Driver', driverSchema);
export default Driver;