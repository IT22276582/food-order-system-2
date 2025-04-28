// import express, { json } from 'express';
// import { connect } from 'mongoose';
// import { mongoUri, port } from './config/config';
// import notificationRoutes from './routes/notificationRoutes';

// const app = express();
// app.use(json());

// // Connect to MongoDB
// connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.use('/notify', notificationRoutes);

// app.listen(port, () => {
//   console.log(`Notification Service running on port ${port}`);
// });



import express, { json } from 'express';
import { connect } from 'mongoose';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(json());

// Get values from environment variables
const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 3000; // default to 3000 if not provided

// Connect to MongoDB
connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/notify', notificationRoutes);

app.listen(port, () => {
  console.log(`Notification Service running on port ${port}`);
});
