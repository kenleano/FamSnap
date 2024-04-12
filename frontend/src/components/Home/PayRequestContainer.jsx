// src/components/StripeContainer.js
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentRequest from './PayRequest';

const stripePromise = loadStripe('pk_test_51P0fXNA5cyf5gOLKjwnxCckHqhufA6t8ELQykq5JJHah5uKTpw07hEIsqnGEx49kllgEA8H86pwoE8IL88ZfS07q00OvXFjklx');

const PayRequestContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentRequest />
    </Elements>
  );
};

export default PayRequestContainer;
