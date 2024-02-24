import React from "react";
import { useEffect, useRef } from "react";

const UploadWidget = () => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dx4yz4grz",
        uploadPreset: "oqqyky8l",
      },
      function (error, result) {
        console.log(result);
      }
    );

    console.log(cloudinaryRef.current);
  }, []);
  return (
    <div>
      <button
        onClick={() => widgetRef.current.open()}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Upload Image
      </button>
    </div>
  );
};

export default UploadWidget;
