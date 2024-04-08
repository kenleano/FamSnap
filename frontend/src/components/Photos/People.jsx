import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { searchImages } from "../api";

const People = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [personPhotos, setPersonPhotos] = useState(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      if (!user || !user.id) {
        setLoading(false);
        setError("No user found");
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3000/familytree/${user.id}`
        );
        setFamilyMembers(response.data);
        console.log("Response Data:", response.data);
      } catch (error) {
        console.error("Failed to load family members", error);
        setError("Failed to load family members");
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyMembers();
  }, [user]);

  const handleClick = async (name) => {
    setLoading(true);
    try {
      const folderPath = `user_${user.id}`;
      const responseJson = await searchImages(name, nextCursor, folderPath);
      setImages(responseJson.resources);
      setPersonPhotos(name); // Store the person's name clicked
      console.log("Params images:", name, nextCursor, folderPath);
    } catch (error) {
      setError("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  console.log("Family members:", familyMembers);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          familyMembers[0].map((family) => (
            <div
              key={family.id}
              onClick={() => handleClick(family.name)}
              className="album-card flex flex-col justify-between p-4 bg-white rounded hover:shadow-lg transition duration-150 ease-in-out h-full cursor-pointer"
            >
              <div className="album-image mt-auto overflow-hidden rounded">
                {family.firstImageUrl ? (
                  <img
                    src={family.firstImageUrl}
                    alt={`Cover of ${family.name}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                    <button className="p-2 bg-blue-700 text-white rounded transition duration-150 ease-in-out hover:bg-blue-800">
                      Upload Image
                    </button>
                  </div>
                )}
              </div>
              <div className="album-details">
                <div className="album-name mt-2 text-center">{family.name}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {personPhotos && (
        <div className="person-photos-section mt-8">
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {images.map((image) => (
              <img
                loading="lazy"
                key={image.public_id}
                src={image.secure_url}
                alt={`Photo of ${personPhotos}`}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default People;
