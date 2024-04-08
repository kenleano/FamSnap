import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import AlbumUploader from "./AlbumUploader";
import { useNavigate } from "react-router-dom";

const AlbumDetails = () => {
  const { user } = useAuth();
  const { albumPath } = useParams();
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const encodedAlbumPath = encodeURIComponent(albumPath);
        const response = await axios.get(
          `http://localhost:3000/albumdetails/${user.id}/${encodedAlbumPath}`
        );
        setImages(response.data);
      } catch (error) {
        console.error("Failed to fetch images:", error);
        setError("Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [albumPath, user.id]);

  const handleImageClick = async (image) => {
    setActiveImage(image);
  };

  const deleteAlbum = async () => {
    if (window.confirm("Are you sure you want to delete this entire album?")) {
      try {
        const encodedAlbumPath = encodeURIComponent(albumPath);
        await axios.delete(
          `http://localhost:3000/deleteAlbum/${user.id}/${encodedAlbumPath}`
        );
        alert("Album deleted successfully");
        // Redirect to another page or update the state to reflect the deletion
        navigate("/photos/albums");
      } catch (error) {
        alert("Failed to delete album: " + error.message);
      }
    }
  };

  const deletePhoto = async (publicId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        await axios.delete(`http://localhost:3000/deletePhoto/${publicId}`);
        setImages(images.filter((img) => img.public_id !== publicId));
        alert("Photo deleted successfully");
      } catch (error) {
        alert("Failed to delete image: " + error.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
        <br/>
         <h2 className=" text-center text-2xl font-semibold text-gray-800">
            {decodeURIComponent(albumPath)} Album
        </h2>
      <div className="flex items-center justify-center p-4">
       

        <AlbumUploader albumPath={albumPath} />
        <button
          onClick={deleteAlbum}
          className="ml-4 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Album
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {images.map((image) => (
            <div
              key={image.public_id}
              className="relative hover:cursor-pointer"
            >
              <img
                src={image.secure_url}
                alt={`Image from ${decodeURIComponent(albumPath)}`}
                className="w-full h-48 object-cover rounded-lg shadow"
                onClick={() => handleImageClick(image)}
              />
            </div>
          ))}
        </div>
      )}
      {activeImage && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-full w-auto mx-4 my-8 sm:mx-auto sm:w-3/4 md:w-1/2 lg:w-1/3">
            <img
              src={activeImage.secure_url}
              alt={activeImage.public_id}
              className="rounded-lg w-full max-h-96 object-contain mx-auto"
            />
            <div className="text-center mt-4">
              <button
                onClick={() => deletePhoto(activeImage.public_id)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setActiveImage(null)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetails;
