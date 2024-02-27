import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  // State for the child, mother, and father details
  const [childDetails, setChildDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthday: "",
  });
  const [motherDetails, setMotherDetails] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });
  const [fatherDetails, setFatherDetails] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });

  // Handler for input changes for child, mother, and father
  const handleChange = (e, setDetails) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      child: childDetails,
      mother: motherDetails,
      father: fatherDetails,
    };

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to register: ${response.status}`);
      }

      const data = await response.json();
      console.log("Registration successful:", data);
      // login(data.user);
      // Redirect or show success message
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      // Show error message
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-xl font-semibold text-center text-gray-800">
        Family Registration
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Details */}
        <div className="space-y-3">
          <h2 className="font-medium text-gray-700">User Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={childDetails.firstName}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={childDetails.lastName}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={childDetails.email}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={childDetails.password}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
            <input
              type="date"
              name="birthday"
              value={childDetails.birthday}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>
        {/* Mother Details */}
        <div className="space-y-3">
          <h2 className="font-medium text-gray-700">Mother Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={motherDetails.firstName}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={motherDetails.lastName}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={motherDetails.birthday}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>
        {/* Father Details */}
        <div className="space-y-3">
          <h2 className="font-medium text-gray-700">Father Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={fatherDetails.firstName}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={fatherDetails.lastName}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={fatherDetails.birthday}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-200"
        >
          Register Family
        </button>
      </form>
    </div>
  );
};

export default Register;
