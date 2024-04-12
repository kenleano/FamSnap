import React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import RequestUpload from "./RequestUpload";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const location = useLocation();
  const artist = location.state.artist;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');


  const [formData, setFormData] = useState({
    userId: user.id,
    artistEmail: artist.email,
    userName: user.firstName + " " + user.lastName,
    artistName: artist.firstName + " " + artist.lastName,
    artistId: artist._id,
    beforeImage: "",
    afterImage: "",
    serviceName: "",
    servicePrice: 0,
    date: new Date().toISOString(),
    status: "Pending",
    message: "",
  });

  const handleUploadSuccess = (url) => {
    setFormData((prevState) => ({
      ...prevState,
      beforeImage: url,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceSelection") {
      const [serviceName, servicePrice] = value.split(" - $");
      setFormData((prevState) => ({
        ...prevState,
        serviceName,
        servicePrice: parseFloat(servicePrice),
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   // In your handleSubmit, set an error message instead of using alert
if (!formData.beforeImage || !formData.serviceName) {
  setErrorMessage('Please upload an image and select a service.');
  return;
} else {
  setErrorMessage(''); // Clear error message on successful validation
}
    try {
      // Directly using formData assumes it's structured correctly as a single object
      const response = await axios.post(
        "http://localhost:3000/requestService",
        formData
      );
      console.log("Request sent:", response.data);
      navigate("/userrequests");
    } catch (error) {
      console.error("Error sending request:", error);
      console.log(formData);
      console.log(artist._id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="block text-gray-700 text-xl font-bold mb-2">
          Request a Service
        </h2>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="artistName"
          >
            Artist Name
          </label>
          <input
            type="text"
            readOnly
            value={`${artist.firstName} ${artist.lastName}`}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="serviceSelection"
          >
            Select Service
          </label>
          <select
            name="serviceSelection"
            onChange={handleChange}
            value={
              formData.serviceName
                ? `${formData.serviceName} - $${formData.servicePrice}`
                : ""
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Please choose an option</option>
            {artist.services.map((service) => (
              <option
                key={service._id}
                value={`${service.name} - $${service.price}`}
              >
                {service.name} - ${service.price}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="imageUpload"
          >
            Select Image
          </label>
          <RequestUpload onUploadSuccess={handleUploadSuccess} />
          {formData.beforeImage && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Uploaded Image:</p>
              <img src={formData.beforeImage} alt="Uploaded" className="mt-2 max-w-xs h-auto rounded-lg shadow" />
            </div>
          )}
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="message"
          >
            Message
          </label>
          <input
            type="text"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your message here"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Contact;
