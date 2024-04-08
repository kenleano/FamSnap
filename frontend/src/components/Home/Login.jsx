import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, category } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const userData = await response.json();
      localStorage.setItem("type", "regular");
      category("regular");
      login(userData);
      console.log("LOGIN userData", userData);
      writeToFile(userData.user.id);
      navigate("/profile");
    } catch (error) {
      console.error(error);
    }
  };

  
  
  const writeToFile = async (userId) => {
    try {
      const response = await fetch("http://localhost:3000/familytree/" + userId);
     
      if (!response.ok) {
        throw new Error("Failed to fetch family tree data");
      }
      const familyTreeData = await response.json();
      console.log("RESPONSE FAMILY TREE", familyTreeData);
      // Write data to db.json
      await fetch("http://localhost:3000/writeToFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(familyTreeData),
      });
    } catch (error) {
      console.error("Error writing to file:", error);
      // Handle error appropriately
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-16 py-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 py-6 w-80">
      <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
        <p className="mt-2 text-sm">Are you an artist? <Link to="/artist-login" className="text-blue-700">Login here</Link></p>
      </form>
    </div>
  );
};

export default Login;
