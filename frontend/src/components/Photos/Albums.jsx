import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";
import CreateAlbum from "./CreateAlbum";

const AlbumViewer = () => {
  const [albums, setAlbums] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`http://localhost:3000/albums/${user.id}`);
          // Assuming the album names might be encoded, decode them before setting state
          const albumsData = response.data.folders.map(folder => ({
            ...folder,
            name: decodeURIComponent(folder.name)  // Decode the name for display
          }));
          setAlbums(albumsData);
        } catch (error) {
          console.error("Error fetching albums:", error);
        }
      }
    };
    fetchAlbums();
  }, [user]);

  const handleClick = (albumPath) => {
    // Ensure the path is encoded for safe URL construction
    navigate(`/photos/albums/${encodeURIComponent(albumPath)}`);
  };

  return (
   <div className="container mx-auto px-4 py-8">
  <div className="text-center font-bold mb-4">
    <CreateAlbum />
  </div>
  <div className="grid grid-cols-3 gap-4">
    {albums.map((album) => (
      <div
        key={album.name}
        className="flex flex-col items-center justify-between p-4 bg-white rounded border border-gray-300 hover:shadow-lg transition duration-150 ease-in-out cursor-pointer"
        onClick={() => handleClick(album.name)}
      >
        <div className="w-full h-48 flex items-center justify-center overflow-hidden">
          {album.firstImageUrl ? (
            <img
              src={album.firstImageUrl}
              alt={`Cover of ${album.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
        <div className="mt-2 text-center">{album.name}</div>
      </div>
    ))}
  </div>
</div>

  );
};

export default AlbumViewer;
