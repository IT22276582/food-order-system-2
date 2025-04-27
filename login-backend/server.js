const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
require('dotenv').config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 5000; // Get port from .env file or default to 5000

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Model
const User = mongoose.model('User', {
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true } // Add email field with unique constraint
});

// Register Route
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  const user = new User({ username, password, email });
  try {
    await user.save();
    res.status(200).send('User registered successfully');
  } catch (err) {
    res.status(400).send('Error: ' + err.message);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    res.status(200).json(user); // send back user details

  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Delete User Route
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted successfully');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Edit User Route
app.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { username, password, email },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send('User updated successfully');
  } catch (err) {
    res.status(400).send('Error: ' + err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
