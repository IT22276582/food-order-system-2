import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import foodItemRoutes from './routes/foodItemRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; // Import order routes
import restaurantAuthRoutes from './routes/restaurantAuthRoutes.js';


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/food-items', foodItemRoutes);
app.use('/api/restaurants', restaurantAuthRoutes);
app.use('/api/orders', orderRoutes); // Add order routes


// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));