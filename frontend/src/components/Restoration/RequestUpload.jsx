import React from "react";
import { useEffect, useRef, useState } from "react";
// import axios from "axios"; // Make sure to import axios
// import { useAuth } from "../AuthContext";
// import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Update the RequestUpload component to accept a prop for the callback
const RequestUpload = ({ onUploadSuccess }) => {
  const [imageUrl, setImageUrl] = useState("");
  const widgetRef = useRef();
  useEffect(() => {
    // Assume cloudinary is available globally

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: "dx4yz4grz",
        uploadPreset: "oqqyky8l",
      },
      (error, result) => {
        if (result.event === "success") {
          console.log("Uploaded Image URL:", result.info.secure_url);

          // Call the callback function with the uploaded image URL
          onUploadSuccess(result.info.secure_url);
          setImageUrl(result.info.secure_url);
        }
      }
    );
  }, [onUploadSuccess]);

  return (
    <>
      <button
        type="button" // Explicitly set the button type to 'button'
        onClick={() => widgetRef.current.open()}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300 ease-in-out"
      >
        Upload New Image
      </button>
    
    </>
  );
};

RequestUpload.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

export default RequestUpload;
