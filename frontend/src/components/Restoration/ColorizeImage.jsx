import React, { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

function ColorizeImage({ imageUrl }) {
  const defaultImageUrl =
    "https://replicate.delivery/pbxt/I9uDZgopnhz6X956zgaBoorFWbUmu5HHDyjkd3BY3ZnxVAdu/1.jpg";
  const defaultRestoredImageUrl =
    "https://replicate.delivery/pbxt/QDMDijnVRXYWNNW32rxQbbClRDwaIfgJSVG1rfvXVeyFB5qgA/tmpvp0xc_2a1.jpg";

  let [restoredImages, setRestoredImages] = useState("");
  let [isSubmitting, setIsSubmitting] = useState(false);
  // const [showCompareSlider, setShowCompareSlider] = useState(true);
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
        setRestoredImages(statusData.output);
      }
    }, 5000); // Check every 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/colorizeImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_name: "Artistic",
          input_image: imageUrl,
          render_factor: 35,
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
    imageUrl = defaultImageUrl;
  }
  if (!restoredImages) {
    setRestoredImages(defaultRestoredImageUrl);
  }

  return (
    <div className="flex justify-center py-10 overflow-x-hidden">
      {" "}
      {/* Added overflow-x-hidden */}
      <div className="max-w-4xl min-w-[300px] mx-auto">
        {isSubmitting && (
          <div className="flex justify-center">
            <ClipLoader color="#0000ff" size={75} />
          </div>
        )}
        {imageUrl !== defaultImageUrl &&
        restoredImages === defaultRestoredImageUrl ? (
          <div>
            <form onSubmit={handleSubmit} className="text-center mb-8">
              <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Colorize Image
              </button>
            </form>
            <img src={imageUrl} alt="Uploaded" /> <p>You uploaded {imageUrl}</p>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <div className="max-w-xl min-w-[800px] min-h-[1000px]">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={imageUrl || defaultImageUrl}
                    alt="Original Image"
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
        )}
      </div>
    </div>
  );
}

ColorizeImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default ColorizeImage;