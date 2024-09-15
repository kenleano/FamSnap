import React from "react";
import { useEffect, useRef } from "react";
import {useAuth } from "../AuthContext";
const UploadWidget = () => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const { user } = useAuth();

  const userId = user.id;

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dx4yz4grz",
        uploadPreset: "oqqyky8l",
        showAdvancedOptions: true,
        folder: `user_${userId}`,

      },
      function (error, result) {
        if (result.event === "success") {
          window.location.reload();
        }
        
      }
    );
      
    
    console.log(cloudinaryRef.current);
  }, []);
  return (
    <div>
      <button
        onClick={() => widgetRef.current.open()}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-300 ease-in-out"
      >
        Upload Image
      </button>
    </div>
  );
};

export default UploadWidget;
