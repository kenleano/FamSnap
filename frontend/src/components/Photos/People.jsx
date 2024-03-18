import React from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { getImages, searchImages } from "../api";

const People = () => {
  const { user } = useAuth();
  const [personPhotos, setPersonPhotos] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [images, setImages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const responseJson = await getImages();
      setImages(responseJson.resources);
      setNextCursor(responseJson.next_cursor);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${user.id}/familymembers`);
        const newData = response.data;
        if (JSON.stringify(newData) !== JSON.stringify(familyMembers)) {
          setFamilyMembers(newData);
        }
      } catch (error) {
        console.error("Failed to load family members:", error);
      }
    };

    if (user && user.id) {
      fetchFamilyMembers();
    }
  }, [user]);

  const handleClick = async (name) => {
    event.preventDefault();
    const responseJson = await searchImages(name, nextCursor);
    setImages(responseJson.resources);
    console.log("name", name);
    console.log("images", responseJson.resources);
    setPersonPhotos(name);
  };
  console.log("family", familyMembers);


  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {familyMembers.map((family) => (
          <div
            key={family._id}
            onClick={() => handleClick(family.firstName)}
            className="album-card flex flex-col justify-between p-4 bg-white rounded hover:shadow-lg transition duration-150 ease-in-out h-full"
          >
            
            <div className="album-image mt-auto overflow-hidden rounded">
              {family.firstImageUrl ? (
                <img
                  src={family.firstImageUrl}
                  alt={`Cover of ${family.firstName}`}
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
              <div className="album-name mt-2 text-center cursor-pointer">
                {family.firstName} {family.lastName}
              </div>
              {/* Insert additional details here if necessary */}
            </div>
          </div>
        ))}
      </div>

      {personPhotos && (
        <div className="person-photos-section mt-8">
          {/* You can uncomment or add a header here if necessary */}
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {images.map((image) => (
              <img
              loading="lazy"
                key={image.public_id}
                src={image.secure_url}
                alt={image.public_id}
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
