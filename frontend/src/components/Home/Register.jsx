import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  // State for the child, mother, and father details
  const [childDetails, setChildDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    password: "",
    birthday: "",
  });
  const [motherDetails, setMotherDetails] = useState({
    firstName: "",
    lastName: "",
    gender: "female", // Default
    birthday: "",
  });
  const [fatherDetails, setFatherDetails] = useState({
    firstName: "",
    lastName: "",
    gender: "male",
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
    <div className="min-h-screen w-full bg-blue-50 px-16 py-8">
      <div className="max-w-lg mx-auto mt-10 space-y-8  bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Family Registration
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              User Details
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={childDetails.firstName}
                onChange={(e) => handleChange(e, setChildDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={childDetails.lastName}
                onChange={(e) => handleChange(e, setChildDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={childDetails.email}
                onChange={(e) => handleChange(e, setChildDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={childDetails.password}
                onChange={(e) => handleChange(e, setChildDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
              <input
                type="date"
                name="birthday"
                value={childDetails.birthday}
                onChange={(e) => handleChange(e, setChildDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
              <label className="inline-flex items-center mr-6">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={childDetails.gender === "male"}
                  onChange={(e) => handleChange(e, setChildDetails)}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={childDetails.gender === "female"}
                  onChange={(e) => handleChange(e, setChildDetails)}
                  className="form-radio h-5 w-5 text-pink-600"
                />
                <span className="ml-2 text-gray-700">Female</span>
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Mother Details
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={motherDetails.firstName}
                onChange={(e) => handleChange(e, setMotherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={motherDetails.lastName}
                onChange={(e) => handleChange(e, setMotherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                value={motherDetails.birthday}
                onChange={(e) => handleChange(e, setMotherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Father Details
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={fatherDetails.firstName}
                onChange={(e) => handleChange(e, setFatherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={fatherDetails.lastName}
                onChange={(e) => handleChange(e, setFatherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
                required
              />
              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                value={fatherDetails.birthday}
                onChange={(e) => handleChange(e, setFatherDetails)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full p-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
          >
            Register Family
          </button>
          {/* <p className="text-center text-sm text-gray-600 mt-4">
            Are you an artist?{" "}
            <Link
              to="/artist-registration"
              className="text-blue-500 hover:text-blue-600"
            >
              Register here
            </Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default Register;
