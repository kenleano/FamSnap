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
    navigate(`/album/${encodeURIComponent(albumPath)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateAlbum />
      <div className="albums grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {albums.map((album) => (
          <div
            key={album.name} // Use the name as key, assuming it's unique enough for this use-case
            className="album-card p-4 bg-white rounded hover:shadow-lg transition-shadow"
            onClick={() => handleClick(album.name)} // Send the unencoded name
          >
            <div className="album-image">
              {album.firstImageUrl ? (
                <img
                  src={album.firstImageUrl}
                  alt={`Cover of ${album.name}`} // Display decoded name
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <div className="album-name mt-2 text-center">{album.name}</div> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumViewer;
