import React, { useState, useEffect } from "react";
import { getImages, searchImages } from "../api";
import { useAuth } from "../AuthContext";
import UploadWidget from "./UploadWidget";

const AllPhotos = () => {
  const { user } = useAuth();
  const [imageList, setImageList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [editableTags, setEditableTags] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/users/${user.id}/familymembers`
        );
        if (!response.ok) {
          throw new Error("Could not fetch family members");
        }
        const data = await response.json();
        setFamilyMembers(data);
      } catch (error) {
        console.error("Failed to load family members:", error);
      }
    };

    if (user && user.id) {
      fetchFamilyMembers();
    }
  }, [user]);

  useEffect(() => {
    if (activeImage && activeImage.tags) {
      setEditableTags(activeImage.tags);
    } else {
      setEditableTags([]);
    }
  }, [activeImage]);

  const saveTags = async () => {
    console.log("Saving tags:", editableTags);
    // Here you would call your API to update the tags for the activeImage
    try {
      const response = await fetch("http://localhost:3000/replaceTags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Correct header for JSON content type
        },
        body: JSON.stringify({
          // Convert the JavaScript object to a JSON string
          tags: editableTags,
          publicId: activeImage.public_id,
        }),
      });
      console.log("tags", editableTags);
      console.log("activeImage", activeImage.public_id);
      if (!response.ok) throw new Error("Failed to add tags");
      // const result = await response.json();
      alert("Tags Updated!"); // Display success message
      // Optionally, clear the form or redirect the user
    } catch (error) {
      alert(error.message); // Display error message
    }
  };

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

  const handleImageClick = async (image) => {
    setActiveImage(null); // Clear previous active image first
    try {
      const response = await fetch(
        `http://localhost:3000/photos/${image.public_id}`
      );
      const details = await response.json();
      setActiveImage(details); // Set active image with all details
    } catch (error) {
      console.error("Error fetching asset details:", error);
      // Handle error - show notification, etc.
    }
  };

  const [tagInput, setTagInput] = useState(""); // State to handle the input field for new tags

  // Function to remove a tag
  const removeTag = (indexToRemove) => {
    setEditableTags((tags) =>
      tags.filter((_, index) => index !== indexToRemove)
    );
  };

  // Function to add a tag
  const addTag = (event) => {
    if (event.key === "Enter" && event.target.value !== "") {
      setEditableTags([...editableTags, event.target.value]);
      setTagInput(""); // Reset input field after adding a tag
    }
  };

  const deletePhoto = async (public_id) => {
    // Ask the user for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/deletePhoto/${public_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete image");
      // Display success message
      alert("Photo deleted successfully");
      // Optionally, you can refresh the page or update the state to remove the deleted photo from the UI
      window.location.reload();
    } catch (error) {
      // Display error message
      alert(error.message);
    }
  };

  return (
    <>
      <UploadWidget />
      <form onSubmit={handleFormSubmit}>
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          required
          placeholder="Enter a search value..."
        />
        <button type="submit">Search</button>
        <button type="button" onClick={resetForm}>
          Clear
        </button>
      </form>
      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {imageList.map((image) => (
          <button key={image.public_id} onClick={() => handleImageClick(image)}>
            <img
              className="w-full h-full object-cover"
              src={image.url}
              alt={image.public_id}
            ></img>
          </button>
        ))}
      </div>
      <div className="footer">
        {nextCursor && (
          <button onClick={handleLoadMoreButtonClick}>Load More</button>
        )}
      </div>
      {activeImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 m-4 sm:m-8 max-w-lg w-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-medium text-white">
                  Edit Image Tags
                </h3>
                <button
                  className="text-black dark:text-white"
                  onClick={() => setActiveImage(null)}
                >
                  ✕
                </button>
              </div>
              <div className="flex">
                <div className="w-full p-4">
                  <img
                    src={activeImage.url}
                    alt={activeImage.public_id}
                    className="rounded"
                  />
                </div>
                <div className="w-1/2 p-4 space-y-4">
                  <div className="flex flex-wrap gap-2 p-2 border rounded">
                    {editableTags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(index)}
                          className="text-blue-500 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={addTag}
                      placeholder="Add a tag..."
                      className="flex-1 border-none focus:ring-0"
                      list="family-list"
                    />
                    <datalist id="family-list">
                      {familyMembers.map((member, index) => (
                        <option key={index} value={`${member.firstName} ${member.lastName}`} /> // Assuming 'name' is the field you want to suggest
                      ))}
                    </datalist>
                  </div>
                  <p>{activeImage.public_id}</p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={saveTags}
                  >
                    Save Tags
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={() => deletePhoto(activeImage.public_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllPhotos;
