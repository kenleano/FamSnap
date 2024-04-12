import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const BankInfo = () => {
  const { user } = useAuth();
  const [bankInfo, setBankInfo] = useState([]);
  const artistId = user.id;

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getBankInfo/${artistId}`);
        setBankInfo(response.data);
      } catch (error) {
        console.error("Error fetching bank info:", error.message);
      }
    };

    fetchBankInfo();
  }, [artistId]);

  const handleDelete = async (paymentId) => {
    try {
      await axios.delete(`http://localhost:3000/deleteBankInfo/${artistId}/${paymentId}`);
      setBankInfo(bankInfo.filter(info => info._id !== paymentId));
      alert("Bank info deleted successfully");
    } catch (error) {
      console.error("Error deleting bank info:", error.message);
      alert("Failed to delete bank info");
    }
  };

  return (
    <div className="container mx-auto p-4 mb-8">
 
      <ul>
        {bankInfo.map(info => (
          <li key={info._id} className="mb-4 p-4 border rounded">
    
            <p><strong>Bank Name:</strong> {info.bankName}</p>
            <p><strong>Account Number:</strong> {info.accountNumber}</p>
            <p><strong>Routing Number:</strong> {info.routingNumber}</p>
            <p><strong>Account Type:</strong> {info.accountType}</p>
            <p><strong>Account Holder Name:</strong> {info.accountHolderName}</p>
            <button
              onClick={() => handleDelete(info._id)}
              className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankInfo;
