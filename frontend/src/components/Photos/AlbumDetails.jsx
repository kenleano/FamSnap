import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { searchImages } from '../api';

const AlbumDetails = () => {
  const { albumPath } = useParams();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Assuming there is no specific search value and cursor
        const responseJson = await searchImages("", null, decodeURIComponent(albumPath));
        console.log("Fetched images:", responseJson.resources);
        setImages(responseJson.resources);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    fetchImages();
  }, [albumPath]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h3 className="text-center mt-4 mb-2">Album Path: {decodeURIComponent(albumPath)}</h3>
      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {images.map((image) => (
          <img
            key={image.public_id}
            src={image.secure_url}
            alt={`Image from ${decodeURIComponent(albumPath)}`}
            className="w-full h-full object-cover"
          />
        ))}
      </div>
    </div>
  );
};

export default AlbumDetails;
