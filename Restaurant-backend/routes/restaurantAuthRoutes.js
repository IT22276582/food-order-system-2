import express from 'express';
import Restaurant from '../models/Restaurant-register.js';

const router = express.Router();

// Register a new restaurant
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if the email is already registered
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const restaurant = new Restaurant({ name, email, password, address });
    await restaurant.save();
    res.status(201).json({ message: 'Restaurant registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register restaurant', details: err.message });
  }
});

// Login a restaurant
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the restaurant by email
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await restaurant.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    res.status(200).json(restaurant); // send back user details


    
  } catch (err) {
    res.status(500).json({ error: 'Failed to login', details: err.message });
  }
});

export default router;