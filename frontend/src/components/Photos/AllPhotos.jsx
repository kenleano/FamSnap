import React from "react";
// import images from "./api-mock.json";
import { useState, useEffect } from "react";
import { getImages, searchImages, uploadImage } from "../api";
import UploadWidget from "./UploadWidget";

const AllPhotos = () => {
  // console.log("images", images);
  const [imageList, setImageList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const responseJson = await getImages();
      setImageList(responseJson.resources);
      setNextCursor(responseJson.next_cursor);
    };
    fetchData();
  }, []);

  const handleLoadMoreButtonClick = async () => {
    const responseJson = await getImages(nextCursor);
    setImageList((currentImageList) => [
      ...currentImageList,
      ...responseJson.resources,
    ]);
    setNextCursor(responseJson.next_cursor);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const responseJson = await searchImages(searchValue, nextCursor);
    setImageList(responseJson.resources);
    setNextCursor(responseJson.next_cursor);
  };

  const resetForm = async () => {
    const responseJson = await getImages();
    setImageList(responseJson.resources);
    setNextCursor(responseJson.next_cursor);

    setSearchValue("");
  };

 const handleImageUpload = async (event) => {
   event.preventDefault();
   const file = event.target.files[0];
   if (!file) {
     alert("Please select a file first!");
     return;
   }
   const formData = new FormData();
   formData.append("image", file);

   try {
     // Adjust the endpoint URL as necessary
     const response = await fetch("/upload", {
       method: "POST",
       body: formData,
     });
     const data = await response.json();
     console.log(data); // Process success response
   } catch (error) {
     console.error("Upload failed:", error);
   }
 };

  return (
      <>
          <UploadWidget/>
      {/* <form>
        <input type="file" onChange={handleImageUpload} />
      </form> */}
      <form onSubmit={handleFormSubmit}>
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          required="required"
          placeholder="Enter a search value..."
        ></input>
        <button type="submit">Search</button>
        <button type="button" onClick={resetForm}>
          Clear
        </button>
      </form>
      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {imageList.map((image) => (
          <img
            className="w-full h-full object-cover"
            key={image.public_id}
            src={image.url}
            alt={image.public_id}
          ></img>
        ))}
      </div>
      <div className="footer">
        {nextCursor && (
          <button onClick={handleLoadMoreButtonClick}>Load More</button>
        )}
      </div>
    </>
  );
};

export default AllPhotos;
