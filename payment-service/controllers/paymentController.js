// controllers/paymentController.js
import Stripe from 'stripe';
import axios from 'axios';
import Transaction from '../models/Transaction.js';
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initiate Payment
const initiatePayment = async (req, res) => {
  const { orderId, amount, currency = 'lkr' } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: { orderId },
    });

    const transaction = new Transaction({
      orderId,
      paymentIntentId: paymentIntent.id,
      amount,
      status: paymentIntent.status,
    });
    await transaction.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await Transaction.updateOne(
      { paymentIntentId },
      { status: paymentIntent.status }
    );

    // // Notify Order Management Service
    // try {
    //   await axios.post('http://localhost:3001/api/orders/update', {
    //     orderId: paymentIntent.metadata.orderId,
    //     status: 'paid',
    //   });
    // } catch (error) {
    //   console.error('Order service error:', error.message);
    // }

    // Trigger Notification Service
    // try {
    //   await axios.post('http://localhost:3002/api/notify', {
    //     orderId: paymentIntent.metadata.orderId,
    //     type: 'payment_confirmation',
    //   });
    // } catch (error) {
    //   console.error('Notification service error:', error.message);
    // }

    res.json({ status: paymentIntent.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund Payment
const refundPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    await Transaction.updateOne(
      { paymentIntentId },
      { status: 'refunded' }
    );

    res.json({ status: refund.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payment Status
const getPaymentStatus = async (req, res) => {
  const { orderId } = req.params;

  try {
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      orderId: transaction.orderId,
      paymentIntentId: transaction.paymentIntentId,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  initiatePayment,
  confirmPayment,
  refundPayment,
  getPaymentStatus,
};
