import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import Iframe from "react-iframe";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const defaultImageUrl =
    "https://replicate.delivery/pbxt/JgdLVwRXXl4oaGqmF4Wdl7vOapnTlay32dE7B3UNgxSwylvQ/Audrey_Hepburn.jpg";
  const defaultRestoredImageUrl =
    "https://replicate.delivery/pbxt/NlSQp8BS4WLxL13eERn20OJzbMYfKpDx4usqAkywlgZY2ZtRA/tmpwg3l1z7wAudrey_Hepburn.png";

  const familyTreeUrl =
    "https://code.balkan.app/Result/family-tree-js/royal-family-tree";

  const space = " ";
  

  return (
    <div className="h-screen flex justify-center items-center px-4">
  
     
  <Carousel
        showArrows={true}
        autoPlay={true}
        infiniteLoop={true}
        showThumbs={true}
        showStatus={false}
        stopOnHover={true}
        swipeable={true}
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={{
                position: "absolute",
                top: "50%",
                right: "0",
                transform: "translateY(-50%)",
                backgroundColor: "#3498db",
                color: "#fff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FaChevronRight />
            </button>
          )
        }
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
                backgroundColor: "#3498db",
                color: "#fff",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              
            >
              <FaChevronLeft />
            </button>
          )
        }
        className="w-full h-full overflow-hidden"
      >
        {/* Slide 1: Before and After Image Slider */}
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-gray-900">
            Restore Your Old Photos
          </h2>
          <p className="text-sm text-gray-600 my-4">
            Upload your old photos and see them come to life with our advanced
            AI restoration tool.
          </p>
          <div className="h-3/4">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={defaultImageUrl}
                  alt="Before restoration"
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={defaultRestoredImageUrl}
                  alt="After restoration"
                />
              }
            />
          </div>
        </div>
        {/* Slide 2: Family Tree Visualization */}
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-gray-900">
            Explore Your Heritage
          </h2>
          <p className="text-sm text-gray-600 my-4">
            Visualize your family history with our interactive family tree tool.
            Click{" "}
            <a
              href={familyTreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              here
            </a>{" "}
            to see a full-scale demo.
          </p>
          <div className="h-3/4 w-full">
            <Iframe
              url={familyTreeUrl}
              className="border-none"
              display="initial"
              position="relative"
              allowFullScreen
              height="100%"
              width="100%"
            />
          </div>
        </div>

        {/* Slide 3: Genealogy Research */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="mt-4">
            <h1 className="text-center text-3xl font-semibold text-gray-900 mb-4">
              Revive Your Memories with FamSnap
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover the magic of advanced AI photo restoration.
              <br />
              Connect your past with the present using our Family Tree
              visualization tool, and manage your family albums with ease.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => (window.location.href = "/register")}
            >
              Get Started
            </button>
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default Home;
