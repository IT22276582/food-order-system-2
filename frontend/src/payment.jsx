import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RHVjYRkJVGAQsLmxIW828RE2KRcUDpGPy1Mf2qUkdCui2iS7ObS57XIU8pH1f79TLyjnNCLIqkD1jTznMBkjaet000NLyONRz');

const Payment = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Starting payment for:', { orderId, amount });
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      setError('Stripe has not loaded. Please try again.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('CardElement not found');
      setError('Card input not found. Please refresh and try again.');
      setProcessing(false);
      return;
    }

    try {
      // Step 1: Initiate payment
      console.log('Sending request to /api/payments/initiate');
      const response = await fetch('http://localhost:3003/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, amount, currency: 'lkr' }),
      });

      console.log('Initiate response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Initiate error:', errorData);
        throw new Error(`Failed to initiate payment: ${errorData.error || response.statusText}`);
      }

      const { clientSecret, paymentIntentId } = await response.json();
      console.log('Received:', { clientSecret, paymentIntentId });

      // Step 2: Confirm payment with Stripe
      console.log('Confirming payment with Stripe');
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Test Customer',
          },
        },
      });

      console.log('Confirm result:', result);
      if (result.error) {
        console.error('Confirm error:', result.error.message);
        setError(result.error.message);
        setProcessing(false);
        return;
      }

      // Step 3: Confirm payment on backend
      console.log('Sending confirm request to /api/payments/confirm');
      const confirmResponse = await fetch('http://localhost:3003/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!confirmResponse.ok) {
        const confirmError = await confirmResponse.json();
        console.error('Confirm backend error:', confirmError);
        throw new Error(`Failed to confirm payment: ${confirmError.error || confirmResponse.statusText}`);
      }

      console.log('Payment confirmed successfully');
      setSuccess(true);
      setProcessing(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error.message);
      setError(error.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Pay for Your Order</h2>
      {success ? (
        <div style={styles.success}>Payment successful! Order ID: {orderId}</div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.cardElement}>
            <CardElement options={cardElementOptions} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="submit"
            disabled={!stripe || processing}
            style={processing ? styles.buttonDisabled : styles.button}
          >
            {processing ? 'Processing...' : `Pay LKR ${amount}`}
          </button>
        </form>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardElement: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
  },
  error: {
    color: 'red',
    fontSize: '14px',
  },
  success: {
    color: 'green',
    fontSize: '16px',
    textAlign: 'center',
  },
};

// CardElement styling options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
};

// Wrap Payment component with Stripe Elements
const PaymentWithStripe = (props) => (
  <Elements stripe={stripePromise}>
    <Payment {...props} />
  </Elements>
);

export default PaymentWithStripe;