import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Use import instead of require

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Driver schema
const driverSchema = new mongoose.Schema({
  name: String,
  licenseNumber: String,
  vehicleType: String,
  availability: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available',
  }
});

const Driver = mongoose.model('Driver', driverSchema);

// Routes
app.post('/drivers', async (req, res) => {
  try {
    const { name, licenseNumber, vehicleType ,availability} = req.body;
    const newDriver = new Driver({ name, licenseNumber, vehicleType });
    await newDriver.save();
    res.status(201).json({ message: 'Driver added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching drivers' });
  }
});

app.get('/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching driver details' });
  }
});

app.post('/drivers/login', async (req, res) => {
  try {
    const { licenseNumber } = req.body;

    const driver = await Driver.findOne({ licenseNumber });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({ message: 'Login successful', driver });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in', details: err.message });
  }
});

//update driver availability
app.patch('/drivers/:id', async (req,res) => {
  try {
    const {availability} = req.body;
    if (!['Available', 'Unavailable'].includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability value' });
    }
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { availability},
      { new: true }

    );
    if (!driver){
      return res.status(404).json({ error: 'Driver not found' });

    }
    res.json({ message: 'Driver availability updated successfully', driver });

  }catch (err) {
    res.status(500).json({ error: 'Error updating driver availability' });
  }
});



// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Driver service running on port ${PORT}`));
