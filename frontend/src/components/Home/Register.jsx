import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../AuthContext"; // Adjust the path as needed

const Register = () => {
  // const { login } = useAuth();
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
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-lg font-semibold text-center">Family Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Child Details */}
        <div>
          <h2 className="font-medium">Child Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={childDetails.firstName}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="input"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={childDetails.lastName}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="input"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={childDetails.email}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={childDetails.password}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="input"
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={childDetails.birthday}
              onChange={(e) => handleChange(e, setChildDetails)}
              className="input"
            />
          </div>
        </div>
        {/* Mother Details */}
        <div>
          <h2 className="font-medium">Mother Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={motherDetails.firstName}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="input"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={motherDetails.lastName}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="input"
              required
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={motherDetails.birthday}
              onChange={(e) => handleChange(e, setMotherDetails)}
              className="input"
            />
          </div>
        </div>
        {/* Father Details */}
        <div>
          <h2 className="font-medium">Father Details</h2>
          <div className="space-y-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={fatherDetails.firstName}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="input"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={fatherDetails.lastName}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="input"
              required
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={fatherDetails.birthday}
              onChange={(e) => handleChange(e, setFatherDetails)}
              className="input"
            />
          </div>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Register Family
        </button>
      </form>
    </div>
  );
};

export default Register;
