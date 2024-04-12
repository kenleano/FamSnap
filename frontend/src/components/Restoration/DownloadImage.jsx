import React from "react";
import { useLocation } from "react-router-dom";

const DownloadImage = () => {
  const location = useLocation();
  const { imageUrl } = location.state; // Access the image URL passed via state

  return (
    <div className="flex flex-col items-center  min-h-screen bg-gray-100 p-20">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Download Your Image</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Restored Image"
          className="max-w-full h-auto" // This ensures the image is responsive
          style={{ minHeight:"720px", maxHeight: "1080px" }} // Limit the max height to 1080p
        />
        <div className="p-4 text-center">
          <a
            href={imageUrl}
            download="Restored_Image.jpg"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download Image
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadImage;
