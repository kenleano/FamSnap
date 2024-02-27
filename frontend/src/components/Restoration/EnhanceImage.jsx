import React, { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

function EnhanceImage({ imageUrl }) {
  const defaultImageUrl =
    "https://replicate.delivery/pbxt/JgdLVwRXXl4oaGqmF4Wdl7vOapnTlay32dE7B3UNgxSwylvQ/Audrey_Hepburn.jpg";
  const defaultRestoredImageUrl =
    "https://replicate.delivery/pbxt/NlSQp8BS4WLxL13eERn20OJzbMYfKpDx4usqAkywlgZY2ZtRA/tmpwg3l1z7wAudrey_Hepburn.png";

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

  return (
    <div className="flex justify-center py-10 overflow-x-hidden">
      {" "}
      {/* Added overflow-x-hidden */}
      <div className="max-w-4xl min-w-[300px] mx-auto">
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
            <div>
              <img src={imageUrl} alt="Uploaded" />{" "}
              <p>You uploaded {imageUrl}</p>
            </div>
          </>
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

EnhanceImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default EnhanceImage;
