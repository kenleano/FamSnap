import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { searchImages } from "../api"; // Make sure this function is imported correctly

const PeopleDetails = () => {
  const { personName } = useParams(); // Assuming 'personName' is the URL parameter
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!user || !user.id) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const folderPath = `user_${user.id}`; // Adjust folderPath if necessary
        const responseJson = await searchImages(decodeURIComponent(personName), nextCursor, folderPath);
        setImages(responseJson.resources);
        setNextCursor(responseJson.next_cursor); // Update the nextCursor if pagination is needed
      } catch (error) {
        console.error("Failed to fetch images:", error);
        setError("Failed to load images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [user, personName, nextCursor]);

  const handleImageClick = (image) => {
    setActiveImage(image);
  };

  const deletePhoto = async (publicId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await axios.delete(`http://localhost:3000/deletePhoto/${publicId}`);
      
      alert("Photo deleted successfully");
      window.location.reload(); // Reload the page to reflect the deletion
    } catch (error) {
      alert("Failed to delete image: " + error.message);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 ">
        <br/>
      <h1 className="text-center text-xl font-bold">Images of {personName}</h1>
      <br/>
   
      <div className="grid gap-4 justify-center content-center grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {images.map((image) => (
          <div key={image.public_id} className="relative hover:cursor-pointer">
            <img
              src={image.secure_url}
              alt={`Image related to ${decodeURIComponent(personName)}`}
              className="w-full h-48 object-cover rounded-lg shadow"
              onClick={() => handleImageClick(image)}
            />
          </div>
        ))}
      </div>
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

export default PeopleDetails;
