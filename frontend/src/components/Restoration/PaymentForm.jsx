import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Watermark from '@uiw/react-watermark';
import { useLocation } from "react-router-dom";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [total, setTotal] = useState("");
  const location = useLocation();
  const { restoredImages } = location.state || {}; 

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: cardholderName,
        email: email,
        address: {
          // Assuming billingAddress is a simple string. Split or structure this according to your actual form fields.
          line1: billingAddress,
        },
      },
    });

    if (error) {
      console.log("[error]", error);
    } else {
      console.log("[PaymentMethod]", paymentMethod);
      // Here you would pass paymentMethod.id and other details to your backend to process the payment
    }
  };
 

  return (
    <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 my-10 mx-auto p-5">
    <div className="order-summary w-auto p-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h3>
      <Watermark 
                      content="FamSnap ©"
                      rotate={20}
                      gapX={5}
                      width={100}
                      gapY={80}
                      height={5}
                      fontSize={12}
                      fontColor="rgb(255 255 255 / 25%)"
                      style={{ background: '#fff' }}>
      <img src={restoredImages} alt="Enhanced Image" className="max-h-96 w-auto mb-4 rounded-md shadow" />
      <div className="absolute inset-0 bg-transparent z-10"></div>
      </Watermark>

      {/* <p className="text-gray-600">{orderSummary}</p> */}
    </div>
    <div className="payment-form w-full md:w-1/2 max-w-md p-5 border rounded-lg shadow-md bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">
          Complete Your Payment
        </h2>

        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Cardholder Name"
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <input
          type="text"
          value={billingAddress}
          onChange={(e) => setBillingAddress(e.target.value)}
          placeholder="Billing Address"
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        <div className="form-group">
          <label
            htmlFor="card-element"
            className="block text-sm font-medium text-gray-700"
          >
            Credit or Debit Card
          </label>
          <div
            id="card-element"
            className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm"
          >
            <CardElement
              className="w-full"
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <label
            htmlFor="total"
            className="block text-sm font-medium text-gray-700"
          >
            Total:
          </label>
          <span className="text-sm font-medium text-gray-900">${total || '1.99'}</span>
        </div>

        <button
          type="submit"
          disabled={!stripe}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Pay ${total || '1.99'}
        </button>
       
      </form>
    </div>
  </div>
   
  );
};

export default PaymentForm;
