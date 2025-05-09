import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './styles/payment.css';

function PaymentWithStripe({ orderId, amount, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setError('Stripe.js has not loaded.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment intent
      const { data } = await axios.post('http://localhost:5005/api/payments/initiate', {
        amount,
        orderId,
      });

      const { clientSecret } = data;

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
        return;
      }

      // Confirm payment on backend
      await axios.post('http://localhost:5005/api/payments/confirm', {
        orderId,
        paymentIntentId: result.paymentIntent.id,
      });

      setSuccess(true);
      setError(null);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <CardElement
          className="card-element"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#333',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#dc3545' },
            },
          }}
        />
        <button
          type="submit"
          className="pay-button"
          disabled={!stripe || processing || success}
        >
          {processing ? 'Processing...' : success ? 'Payment Successful' : `Pay LKR ${amount}`}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Payment completed successfully!</div>}
    </div>
  );
}

export default PaymentWithStripe;