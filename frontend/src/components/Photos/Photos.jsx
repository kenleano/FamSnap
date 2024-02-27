// In Photos.jsx
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
    <>
      <div className="flex justify-center py-10">
        {user.lastName} Family Album
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row w-full justify-center">
          <div className="w-1/4">
            <PhotosNav />
          </div>
          <div className="w-3/4">
            <Routes>
              <Route path="/" element={<AllPhotos />} />
              <Route path="people" element={<People />} />
              <Route path="albums" element={<Albums />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default Photos;
