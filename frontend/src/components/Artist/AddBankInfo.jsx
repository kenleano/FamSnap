import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import BankInfo from "./BankInfo";

const AddBankInfo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [formData, setFormData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/addBankInfo", {
        userId: user.id,
        bankInfo: formData,
      });
      alert("Bank info added successfully!");
      navigate("/artist-dashboard");
    } catch (error) {
      console.error("Error submitting bank info:", error.response.data);
      alert("Failed to add bank info");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div
        className="flex items-center justify-between cursor-pointer border-b border-gray-200 pb-2 mb-4"
        onClick={toggleVisibility}
      >
        <h2 className="text-xl font-semibold">Bank Information</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform duration-200 ${
            !isVisible ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
       
      </div>
      <div>
      <BankInfo />
      </div>

      {!isVisible && (
        <div className="mt-4 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="mt-8 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 space-y-6"
          >
            <h1 className="text-2xl font-bold text-center mb-6">
              Add Bank Information
            </h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Bank Name"
                required
                className="input border"
              />
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Account Holder's Name"
                required
                className="input border"
              />
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Account Number"
                required
                className="input border rounded"
              />
              <input
                type="text"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="Routing Number"
                required
                className="input border"
              />
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                required
                className="select border"
              >
                <option value="">Select Account Type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="Card Number"
                required
                className="input border"
              />
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="Expiration Date"
                required
                className="input border"
              />
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="CVV"
                required
                className="input border"
              />
            </div>
            <button
              type="submit"
              className="btn w-full bg-blue-500 text-white border border-blue-500 hover:bg-blue-700"
            >
              Submit Bank Info
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddBankInfo;
