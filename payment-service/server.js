// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/payments', paymentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
