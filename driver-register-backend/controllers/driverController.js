import Driver from '../models/Driver.js';
import jwt from 'jsonwebtoken';

export const addDriver = async (req, res) => {
  try {
    const { name, licenseNumber, vehicleType, availability, location } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const newDriver = new Driver({ name, licenseNumber, vehicleType, availability, location });
    await newDriver.save();
    res.status(201).json({ message: 'Driver added successfully', driver: newDriver });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching drivers' });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching driver details' });
  }
};

export const loginDriver = async (req, res) => {
  try {
    const { licenseNumber } = req.body;

    const driver = await Driver.findOne({ licenseNumber });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: driver._id, licenseNumber: driver.licenseNumber },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', driver, token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in', details: err.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { availability, location } = req.body;

    if (availability && !['Available', 'Unavailable'].includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability value' });
    }

    if (location && typeof location !== 'string') {
      return res.status(400).json({ error: 'Invalid location value' });
    }

    const updateFields = {};
    if (availability) updateFields.availability = availability;
    if (location) updateFields.location = location;

    const driver = await Driver.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ message: 'Driver updated successfully', driver });
  } catch (err) {
    res.status(500).json({ error: 'Error updating driver', details: err.message });
  }
};

export const getDriversByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    const drivers = await Driver.find({ location: { $regex: new RegExp(location, 'i') } });

    if (drivers.length === 0) {
      return res.status(404).json({ message: 'No drivers found in this location' });
    }

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching drivers by location', details: err.message });
  }
};