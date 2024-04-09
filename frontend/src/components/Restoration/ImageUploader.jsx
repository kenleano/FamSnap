
import PropTypes from "prop-types";

const ImageUpload = ({ setImageUrl }) => {

  const openUploadWidget = () => {
    const widgetOptions = {
      cloudName: "dx4yz4grz",
      uploadPreset: "jztmtwbe",
      sources: [
        "local",
        "url",
        "camera",
        "image_search",
        "facebook",
        "dropbox",
        "instagram",
        "google_drive",
      ],
      multiple: false,
      cropping: false, 
    };
    window.cloudinary.openUploadWidget(widgetOptions, (error, result) => {
      if (!error && result && result.event === "success") {
        console.log("Upload successful:", result.info);
        setImageUrl(result.info.secure_url); 
      } else if (error) {
        console.log("Upload error:", error);
      }
    });
  };
  return (
    <div>
      <button
        onClick={openUploadWidget}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Upload Image
      </button>
    </div>
  );
};
ImageUpload.propTypes = {
  setImageUrl: PropTypes.func.isRequired,
};
export default ImageUpload;
