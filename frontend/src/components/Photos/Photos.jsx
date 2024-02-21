import React from "react";
import AllPhotos from "./AllPhotos";
import PhotosNav from "./PhotosNavigation";
import { useAuth } from "../AuthContext";

const Photos = () => {
  const { user } = useAuth();
  return (
    <>
      <div className="flex justify-center w-screen">
        {user.lastName} Family Album
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row w-full justify-center">
          <div className="w-1/4">
            <PhotosNav />
          </div>
          <div className="w-3/4">
            <AllPhotos />
          </div>
        </div>
      </div>
    </>
  );
};

export default Photos;
