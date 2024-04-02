import React from "react";
import { useEffect, useRef } from "react";
import axios from "axios"; // Make sure to import axios
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
const UploadWidget = () => {
    const navigate = useNavigate();
  const cloudinaryRef = useRef();
  
  const widgetRef = useRef();
    const { user } = useAuth();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dx4yz4grz",
        uploadPreset: "oqqyky8l",
        showAdvancedOptions: true,
      },
      async (error, result) => {
        if (result.event === "success") {
          console.log('Uploaded Image URL:', result.info.secure_url);
          // Example POST request to your server with the uploaded image URL
          try {
            const response = await axios.post('http://localhost:3000/portfolioUpload', {
              artistId: user.id, // Replace with the actual artist ID
              imageUrl: result.info.secure_url,
            });
            console.log('Server response:', response.data);
           
          } catch (error) {
            console.error('Error saving image URL to database:', error);
          }
        }
        navigate("/artist-dashboard");
      }
    );
  }, []);

  return (
    <button
      onClick={() => widgetRef.current.open()}
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
    >
      Upload Image
    </button>
  );
};

export default UploadWidget;
