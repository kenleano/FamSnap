import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext"; // Import useAuth hook

const AddFamilyMemberForm = () => {
  const { user } = useAuth(); // Use the useAuth hook to get the current user
  const userID = user.id; // Get the user ID from the authenticated user

  const [familyMembers, setFamilyMembers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    familyId: userID, // Set the familyId to the logged-in user's ID
    mid: null, // Mother's ID
    fid: null, // Father's ID
    pid: null, // Partner's ID
  });

  useEffect(() => {
    // Fetch existing family members
    const fetchFamilyMembers = async () => {
      const response = await fetch(
        `http://localhost:3000/users/${userID}/familymembers`
      );
      const data = await response.json();
      setFamilyMembers(data);
    };

    if (userID) {
      // Check if userID is not null or undefined
      fetchFamilyMembers();
    }
  }, [userID]); // Dependency array, re-fetch when userID changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/addfamily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("formData", formData);
      if (!response.ok) throw new Error("Failed to add family member");
      const result = await response.json();
      alert(result.message); // Display success message
      // Optionally, clear the form or redirect the user
    } catch (error) {
      alert(error.message); // Display error message
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-5">
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="date"
        name="birthday"
        value={formData.birthday}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        name="mid"
        value={formData.mid}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Mother</option>
        {familyMembers.map((member) => (
          <option key={member._id} value={member._id}>
            {member.firstName} {member.lastName}
          </option>
        ))}
      </select>
      <select
        name="fid"
        value={formData.fid}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Father</option>
        {familyMembers.map((member) => (
          <option key={member._id} value={member._id}>
            {member.firstName} {member.lastName}
          </option>
        ))}
      </select>
      <select
        name="pid"
        value={formData.pid}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Partner</option>
        {familyMembers.map((member) => (
          <option key={member._id} value={member._id}>
            {member.firstName} {member.lastName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Family Member
      </button>
    </form>
  );
};

export default AddFamilyMemberForm;
