import React from "react";
import { Routes, Route } from "react-router-dom";
import AllPhotos from "./AllPhotos";
import Albums from "./Albums";
import People from "./People";
import PhotosNav from "./PhotosNavigation";
import { useAuth } from "../AuthContext";

const Photos = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          {user.lastName} Family Album
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 mb-8 md:mb-0">
          <div className="sticky top-0">
            <PhotosNav />
          </div>
        </div>

        {/* Display Content */}
        <div className="w-full md:w-3/4">
          <Routes>
            <Route path="/" element={<AllPhotos />} />
            <Route path="people" element={<People />} />
            <Route path="albums" element={<Albums />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Photos;
