import React, { useState, useEffect } from "react";
import axios from "axios";
import { getImages, searchImages } from "../api";

const AlbumViewer = () => {
  const [albums, setAlbums] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [images, setImages] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [nextCursor, setNextCursor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const responseJson = await getImages();
      setImageList(responseJson.resources);
      setNextCursor(responseJson.next_cursor);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get("http://localhost:3000/albums"); // Adjust URL as needed
        const albumsData = response.data.folders;
        const updatedAlbums = await Promise.all(
          albumsData.map(async (album) => {
            const firstImageResponse = await searchImages(album.name);
            return {
              ...album,
              firstImageUrl:
                firstImageResponse.resources.length > 0
                  ? firstImageResponse.resources[0].secure_url
                  : null,
            };
          })
        );
        setAlbums(updatedAlbums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };
    fetchAlbums();
  }, []);

  const handleClick = async (albumName) => {
    event.preventDefault();
    setSearchValue(albumName);

    const responseJson = await searchImages(albumName, nextCursor);
    setImages(responseJson.resources);
    setCurrentAlbum(albumName);
  };

  return (
    <div>
      <div className="albums grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {albums.map((album) => (
          <div
            key={album.name}
            className="album-card p-4 bg-white rounded hover:shadow-lg transition-shadow"
            onClick={() => handleClick(album.path)}
          >
            <div className="album-image">
              {album.firstImageUrl ? (
                <img
                  src={album.firstImageUrl}
                  alt={`Cover of ${album.name}`}
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
      {currentAlbum && (
        <>
          <h3>{currentAlbum}</h3>
          <div className="images grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {images.map((image) => (
              <img
                key={image.public_id}
                src={image.secure_url}
                alt={image.public_id}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AlbumViewer;
