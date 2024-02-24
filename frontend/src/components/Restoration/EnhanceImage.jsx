import React, { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import PropTypes from "prop-types";

function EnhanceImage({ imageUrl }) {
  //   const [imageUrl, setImageUrl] = useState("");
  const defaultImageUrl = "https://i.imgur.com/DQsaKxh.jpg"; // Corrected default image URL
  const defaultRestoredImageUrl = "https://i.imgur.com/En0YKIc.jpg"; // Corrected default image URL

  let [restoredImages, setRestoredImages] = useState("");
  let [isSubmitting, setIsSubmitting] = useState(false); // Corrected usage for setIsSubmitting

  const checkStatus = async (id) => {
    try {
      const statusResponse = await fetch(
        `http://localhost:3000/checkStatus/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const statusData = await statusResponse.json();
      return statusData;
    } catch (error) {
      console.error("Failed to check status", error);
      return null;
    }
  };

  const pollStatus = async (id) => {
    const checkInterval = setInterval(async () => {
      const statusData = await checkStatus(id);
      if (statusData && statusData.status === "succeeded") {
        clearInterval(checkInterval);
        setIsSubmitting(false);
        setRestoredImages(statusData.output); // Assuming 'output' contains the final image URLs
      }
    }, 5000); // Check every 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/restoreImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hdr: 0.7,
          image: imageUrl,
          steps: 20,
          prompt: "UHD 4k",
          scheduler: "DDIM",
          creativity: 0.5,
          guess_mode: false,
          resolution: 2048,
          resemblance: 1,
          guidance_scale: 5,
          negative_prompt:
            "Teeth, tooth, open mouth, longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, mutant",
        }),
      });

      const initialData = await response.json();
      if (initialData && initialData.id) {
        pollStatus(initialData.id);
      } else {
        setIsSubmitting(false);
        console.error("No ID returned from initial request");
      }
    } catch (error) {
      console.error("Failed to restore image", error);
      setIsSubmitting(false);
    }
  };
  if (!imageUrl) {
    imageUrl = defaultImageUrl; // Use a local variable for rendering if props are not provided
  }
  if (!restoredImages) {
    setRestoredImages(defaultRestoredImageUrl); // This will only run once due to how React batches state updates
  }
  return (
    <div className="flex justify-center w-screen py-10">
      <div className="w-full max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="text-center mb-8">
          <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out">
            Restore Image
          </button>
        </form>
        <div className="flex justify-center items-center">
          <div className="w-full">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={imageUrl || defaultImageUrl}
                  alt="Default Image"
                  className="shadow-lg rounded-lg"
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={restoredImages || defaultRestoredImageUrl}
                  alt="Restored Image"
                  className="shadow-lg rounded-lg"
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

EnhanceImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default EnhanceImage;
