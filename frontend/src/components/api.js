const API_URL = "http://localhost:3000";

export const getImages = async (nextCursor) => {
  const params = new URLSearchParams();
  if (nextCursor) {
    params.append;
    "next_cursor", nextCursor;
  }
  const response = await fetch(`${API_URL}/photos?${params}`);
  const responseJson = await response.json();
  return responseJson;
};

export const searchImages = async (searchValue, nextCursor, folderPath) => {
  const params = new URLSearchParams();
  params.append("expression", `folder:${folderPath} AND ${searchValue}`);
  if (nextCursor) {
    params.append("next_cursor", nextCursor);
  }
  const response = await fetch(`${API_URL}/search?${params}`);
  const responseJson = await response.json();
  return responseJson;
};



export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,

    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const responseData = await response.json();
    console.log("Upload successful:", responseData);
    alert("Upload successful!");
  } catch (error) {
    console.error("Upload error:", error);
    alert("Upload failed.");
  }
};
