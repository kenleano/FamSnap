import React, { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";
import ImageUpload from "./ImageUploader";
import { useNavigate } from "react-router-dom";
import Watermark from "@uiw/react-watermark";

function ColorizeImage({ setImageUrl, imageUrl }) {
  const navigate = useNavigate();
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
  const handlePurchaseClick = () => {
    // Navigate to /payment and pass imageUrl as state
    navigate("/payment", { state: { restoredImages } });
  };

  return (
    <div className="flex justify-center py-5 overflow-x-hidden">
      <div className="max-w-4xl min-w-[300px] mx-auto">
        <div className="flex justify-center my-4">
        {!isSubmitting && <ImageUpload setImageUrl={setImageUrl} />}

        </div>
        {isSubmitting && (
          <div className="flex justify-center">
            <ClipLoader color="#0000ff" size={75} />
          </div>
        )}
        {imageUrl !== defaultImageUrl && restoredImages === defaultRestoredImageUrl ? (
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
              {restoredImages !== defaultRestoredImageUrl && (
                <div className="flex justify-center mt-4 my-4">
                  <button
                    type="button"
                    onClick={handlePurchaseClick}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                  >
                    Purchase for $1.99!
                  </button>
                </div>
              )}
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={imageUrl || defaultImageUrl}
                    alt="Original Image"
                    className="shadow-lg rounded-lg"
                  />
                }
                itemTwo={
                  restoredImages !== defaultRestoredImageUrl ? (
                    <Watermark
                      content="FamSnap ©"
                      rotate={20}
                      gapX={5}
                      width={100}
                      gapY={80}
                      height={5}
                      fontSize={12}
                      fontColor="rgb(255 255 255 / 25%)"
                      style={{ background: "#fff" }}
                    >
                      <div className="absolute inset-0 bg-transparent z-10"></div>
                      <ReactCompareSliderImage
                        src={restoredImages || defaultRestoredImageUrl}
                        alt="Restored Image"
                        className="shadow-lg rounded-lg"
                      />
                    </Watermark>
                  ) : (
                    <ReactCompareSliderImage
                      src={restoredImages || defaultRestoredImageUrl}
                      alt="Restored Image"
                      className="shadow-lg rounded-lg"
                    />
                  )
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

ColorizeImage.propTypes = {
  setImageUrl: PropTypes.string.isRequired,
};

export default ColorizeImage;
