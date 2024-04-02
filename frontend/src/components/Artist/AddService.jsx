import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const AddService = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [services, setServices] = useState([]); // [{}

  const deleteService = async (public_id) => {
    // Ask the user for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/deleteService/${user.id}/${public_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete service");
      // Display success message
      alert("Service deleted successfully");
      // Optionally, you can refresh the page or update the state to remove the deleted photo from the UI
      window.location.reload();
    } catch (error) {
      // Display error message
      alert(error.message);
    }
  };

  useEffect(() => {
    axios
      .get(`http://localhost:3000/getServices/${user.id}`)
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) =>
        console.error("There was an error fetching the services:", error)
      );
  }, [user]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const payload = {
    artistId: user.id,
    service: formData,
  };

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
      const response = await axios.post(
        "http://localhost:3000/addService",
        payload
      );
      console.log("Service addition successful:", response.data);
      window.location.reload();

      // You can redirect or clear form here
    } catch (error) {
      console.error("Error registering:", error.response.data);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div 
    className="flex items-center justify-between cursor-pointer border-b border-gray-200 pb-2 mb-4"
    onClick={toggleVisibility}
  >
    <h2 className="text-xl font-semibold">Services</h2>
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-200 ${!isVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
      {!isVisible && (
        <div>
          <div className=" mt-4 space-y-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="rounded-lg border bg-white border-gray-200 p-4 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  Name: {service.name}
                </h3>
                <p className="text-gray-600">
                  Description: {service.description}
                </p>
                <p className="text-gray-600">Price: ${service.price}</p>
                <button
                  onClick={() => deleteService(service._id)}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <h1 className="text-2xl font-bold text-center mb-6">Add Service</h1>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 h-32 resize-none"
            ></textarea>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <button
              type="submit"
              className="w-full flex justify-center py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-200 ease-in-out"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddService;
