import React, { useEffect, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";
import Watermark from "@uiw/react-watermark";
import { useNavigate } from "react-router-dom";
import ImageUpload from "./ImageUploader";

function EnhanceImage({ setImageUrl, imageUrl }) {
  const defaultImageUrl =
    "https://replicate.delivery/pbxt/JgdLVwRXXl4oaGqmF4Wdl7vOapnTlay32dE7B3UNgxSwylvQ/Audrey_Hepburn.jpg";
  const defaultRestoredImageUrl =
    "https://replicate.delivery/pbxt/NlSQp8BS4WLxL13eERn20OJzbMYfKpDx4usqAkywlgZY2ZtRA/tmpwg3l1z7wAudrey_Hepburn.png";

  let [restoredImages, setRestoredImages] = useState("");
  let [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
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
      const response = await fetch("http://localhost:3000/restoreImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageUrl,
          upscale: 2,
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: 0.8,
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

  const preventDownload = (event) => {
    // Check if the event target is one of our images
    if (event.target.tagName === "IMG") {
      // You can add more conditions if needed
      event.preventDefault();
    }
  };
  useEffect(() => {
    // Attach the event listener to the document
    document.addEventListener("contextmenu", preventDownload);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("contextmenu", preventDownload);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  const handlePurchaseClick = () => {
    // Navigate to /payment and pass imageUrl as state
    navigate("/payment", { state: { restoredImages } });
  };

  return (
    <div className="flex justify-center py-5 overflow-x-hidden">
      <div className="max-w-4xl min-w-[300px] mx-auto">
        <div className="flex justify-center my-4">
          <ImageUpload setImageUrl={setImageUrl} />
        </div>
        {isSubmitting && (
          <div className="flex justify-center">
            <ClipLoader color="#0000ff" size={150} />
          </div>
        )}
        {imageUrl !== defaultImageUrl &&
        restoredImages === defaultRestoredImageUrl ? (
          <>
            <form onSubmit={handleSubmit} className="text-center mb-8">
              <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Enhance Image
              </button>
            </form>
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="shadow-lg rounded-lg w-full h-full"
              />
            </div>
            <p>You uploaded {imageUrl}</p>
          </>
        ) : (
          <div className="flex justify-center items-center">
            <div className="relative w-full h-full max-w-xl min-w-[800px] min-h-[1000px]">
              {restoredImages !== defaultRestoredImageUrl && (
                <div className="flex justify-center mt-4 my-4">
                  {" "}
                  {/* This wrapper ensures horizontal centering */}
                  <button
                    type="button"
                    onClick={handlePurchaseClick}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                  >
                    Purchase for $1.99!
                  </button>
                </div>
              )}
              {/* <a href={restoredImages} target="_blank" className="bg-blue-500 text-white font-bold">Test</a> */}
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

EnhanceImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

EnhanceImage.propTypes = {
  setImageUrl: PropTypes.string.isRequired,
};
export default EnhanceImage;
