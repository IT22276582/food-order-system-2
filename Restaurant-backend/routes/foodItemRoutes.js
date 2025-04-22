import express from 'express';
import FoodItem from '../models/FoodItem.js';

const router = express.Router();

// Create a new food item
router.post('/', async (req, res) => {
  try {
    const { name, price, description, restaurant, availability } = req.body;
    const foodItem = new FoodItem({ name, price, description, restaurant, availability });
    await foodItem.save();
    res.status(201).json({ message: 'Food item created successfully', foodItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create food item', details: err.message });
  }
});

// Get all food items
router.get('/', async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food items', details: err.message });
  }
});

// Get a single food item by ID
router.get('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food item', details: err.message });
  }
});

// Update a food item by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, price, description, restaurant, availability } = req.body;
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { name, price, description, restaurant, availability },
      { new: true }
    );
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item updated successfully', foodItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update food item', details: err.message });
  }
});

// Update availability of a food item
router.patch('/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;
    if (!['Available', 'Unavailable'].includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability value' });
    }
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true } // Return the updated document
    );
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Availability updated successfully', foodItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability', details: err.message });
  }
});

// Delete a food item by ID
router.delete('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food item', details: err.message });
  }
});

export default router;