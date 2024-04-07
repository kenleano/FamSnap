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
    const response = await fetch(`http://localhost:3000/replaceTags/${user.id}`, {
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
    console.log("activeImage TEST", activeImage.public_id);
    if (!response.ok) throw new Error("Failed to add tags");
    // const result = await response.json();
    alert("Tags Updated!"); // Display success message
    // Optionally, clear the form or redirect the user
  } catch (error) {
    alert(error.message); // Display error message
  }
};


  useEffect(() => {
    // Update fetchData function to fetch images for a specific user
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/photos/${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch photos");
        }
        const data = await response.json();
        setImageList(data);
      } catch (error) {
        console.error("Failed to load photos:", error);
      }
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

  const deletePhoto = async (userId, publicId) => {
    // Ask the user for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/deletePhoto/${publicId}`,
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

  console.log("activeImage", activeImage);
  return (
    <>
      <UploadWidget />
      <br />
      <form
        onSubmit={handleFormSubmit}
        className="flex items-center space-x-2 mb-4"
      >
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          required
          placeholder="Enter a search value..."
          className="form-input px-4 py-2 rounded-md border border-gray-300 w-full focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Clear
        </button>
      </form>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {imageList.map((image) => (
          <button
            key={image.public_id}
            onClick={() => handleImageClick(image)}
            className="focus:outline-none"
          >
            <img
              className="w-full h-48 object-cover rounded-lg shadow"
              src={image.url}
              alt=""
            />
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {nextCursor && (
          <button
            onClick={handleLoadMoreButtonClick}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Load More
          </button>
        )}
      </div>

      {activeImage && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 overflow-y-auto">
          <div className="flex items-center justify-center  px-4 text-center">
            <div className="bg-white rounded-lg shadow-xl transform transition-all my-8 max-w-4xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Edit Image Tags
                    </h3>
                    <div className="mt-2">
                      <img
                        src={activeImage.url}
                        alt={activeImage.public_id}
                        className="rounded-lg w-auto mx-auto"
                      />
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 items-center justify-center">
                        {editableTags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(index)}
                              className="text-blue-500 text-sm"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={addTag}
                        placeholder="Add a tag..."
                        className="form-input mt-3 w-full rounded-md border-gray-300 shadow-sm"
                        list="family-list"
                      />
                      <datalist id="family-list">
                        {familyMembers.map((member, index) => (
                          <option
                            key={index}
                            value={`${member.firstName} ${member.lastName}`}
                          />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={saveTags}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Tags
                </button>
                <button
                  onClick={() => setActiveImage(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => deletePhoto(user.id, activeImage.public_id)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllPhotos;
