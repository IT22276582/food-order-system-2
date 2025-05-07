const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  const user = new User({ username, password, email });
  try {
    await user.save();
    res.status(200).send('User registered successfully');
  } catch (err) {
    res.status(400).send('Error: ' + err.message);
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};

exports.deleteUser = async (req, res) => {
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
};

exports.editUser = async (req, res) => {
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
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
};