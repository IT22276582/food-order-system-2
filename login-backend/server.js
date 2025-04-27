// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors'); // Import cors
// require('dotenv').config(); // Load .env file

// const app = express();
// const PORT = process.env.PORT || 5000; // Get port from .env file or default to 5000

// // Middleware
// app.use(bodyParser.json());
// app.use(cors()); // Enable CORS

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // User Model
// const User = mongoose.model('User', {
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   email: { type: String, unique: true, sparse: true } // Add email field with unique constraint
// });

// // Register Route
// app.post('/register', async (req, res) => {
//   const { username, password, email } = req.body;

//   const user = new User({ username, password, email });
//   try {
//     await user.save();
//     res.status(200).send('User registered successfully');
//   } catch (err) {
//     res.status(400).send('Error: ' + err.message);
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
   import mongoose from 'mongoose';
   import bodyParser from 'body-parser';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import authRoutes from './routes/authRoutes.js';

   dotenv.config();

   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware
   app.use(bodyParser.json());
   app.use(cors());

   // Connect to MongoDB
   mongoose.connect(process.env.MONGO_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.error('MongoDB connection error:', err));

   // Routes
   app.use('/api/auth', authRoutes);

   // Start server
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });