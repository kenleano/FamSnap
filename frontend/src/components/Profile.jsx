import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Keep this if you need to get userId
import { useNavigate } from "react-router-dom";


const ProfileEdit = () => {
  const { user, logout } = useAuth();
  console.log("user", user);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    message: "",
    show: false,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", // Placeholder for new password, consider security
    birthday: "",
  });

  useEffect(() => {
    // Fetch user data if user.id is available
    if (user && user.id) {
      axios
        .get(`http://localhost:3000/getUser/${user.id}`)
        .then((response) => {
          const { firstName, lastName, email, birthday } = response.data;
          setFormData({
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
            password: "", // Do not prefill password
            birthday: birthday ? birthday.split("T")[0] : "", // Adjust if your date format is different
          });
        })
        .catch((error) =>
          console.error("There was an error fetching the user data:", error)
        );
      console.log("user", formData);
    }
  }, [user]); // Depend on user to refetch if it changes

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
      const response = await fetch(
        `http://localhost:3000/updateUser/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            // password: formData.password, // Make sure your backend handles password hashing
            birthday: formData.birthday,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      setNotification({
        message: "Profile updated successfully!",
        show: true,
      });
      setTimeout(() => setNotification({ message: "", show: false }), 3000);
      // Optionally, refresh user info in context or trigger a re-fetch
      console.log("Profile updated successfully");
      // Navigate to profile page or show a success message
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show an error message to the user
      // Update notification state for error
      setNotification({ message: "Error updating profile.", show: true });
      // Hide notification after 3 seconds
      setTimeout(() => setNotification({ message: "", show: false }), 3000);
    }
  };
  const handleLogout = () => {
    logout();
    deleteFileContent();
    navigate("/login"); // Navigate to the login page after logout
  };


  const deleteFileContent = async () => {
    try {
      // Delete content of db.json
      await fetch("http://localhost:3000/deleteFileContent", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting file content:", error);
      // Handle error appropriately
    }
  };
  return (
    <div className="min-h-screen w-full bg-blue-50 px-16 py-8">
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto my-8 space-y-4 bg-white p-6 rounded-md shadow"
    >
      <h3 className="text-2xl font-semibold text-gray-800">Profile</h3>
      {notification.show && (
        <div
          className={`alert ${
            notification.message.startsWith("Error")
              ? "bg-red-500"
              : "bg-green-500"
          } text-white p-3 rounded-md`}
        >
          {notification.message}
        </div>
      )}
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      {/* <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="New Password"
          className="mt-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div> */}
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Birthday</label>
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <button
        type="submit"
        className="w-full p-3 mt-4 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Update Profile
      </button>

      <button
        type="button" // Update type to 'button' to prevent form submission
        className="w-full p-3 mt-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
        onClick={handleLogout}
      >
        Logout
      </button>
    </form>
  </div>
  );
};

export default ProfileEdit;
