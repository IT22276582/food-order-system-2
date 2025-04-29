import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRouter from './routes/orderRouter.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRouter);

const PORT = process.env.PORT || 5004;
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/order-service';

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});