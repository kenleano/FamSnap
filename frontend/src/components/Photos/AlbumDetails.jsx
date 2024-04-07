import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const AlbumDetails = () => {
    const { user } = useAuth();
    const { albumPath } = useParams();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchImages = async () => {
          setLoading(true);
          setError(null);
          try {
              // Ensure the albumPath is encoded when used in the URL
              const encodedAlbumPath = decodeURIComponent(albumPath);
              const response = await axios.get(`http://localhost:3000/albumdetails/${user.id}/${encodedAlbumPath}`);
              
              setImages(response.data);
          } catch (error) {
              console.error("Failed to fetch images:", error);
              setError("Failed to fetch images");
          } finally {
              setLoading(false);
          }
      };
      fetchImages();
  }, [albumPath]);
    return (
        <div className="container mx-auto px-4 py-8">
            <h3 className="text-center mt-4 mb-2">Album: {user.id}/{decodeURIComponent(albumPath)}</h3>
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
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
            )}
        </div>
    );
};

export default AlbumDetails;
