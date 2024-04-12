import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProfessionalArtist = () => {
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getAllArtists`);
        setArtists(response.data);
      } catch (error) {
        console.error("There was an error fetching the artists:", error);
      }
    };

    fetchData();
    return () => {}; // Optional cleanup mechanism
  }, []);

  const handleOpenModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  const handleOpenServicesModal = (service) => {
    console.log("Opening Services Modal with:", service);
    setServices(service);
    setShowServicesModal(true);
  };

  const handleCloseServicesModal = () => {
    console.log("Closing Services Modal");
    setShowServicesModal(false);
  };

  return (
    <div className="min-h-screen w-full bg-blue-50 px-16 py-8">
    <h1 className="text-3xl font-bold text-center mb-10 text-blue-900">Professional Artists</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artists.map((artist, index) => (
        <div
          key={index}
          className="flex flex-col bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
        >
          <div className="p-6 flex flex-col justify-between h-full">
            <h3 className="font-bold text-xl mb-4 text-blue-800">{artist.firstName} {artist.lastName}</h3>
            <div className="mb-4">
              <label className="font-bold block mb-2 text-blue-800">Services:</label>
              <div className="flex flex-wrap mt-2">
                {artist.services.slice(0, 3).map((service, serviceIndex) => (
                  <button
                    key={serviceIndex}
                    className="mr-4 mb-2 bg-blue-500 text-white font-semibold py-1 px-2 rounded hover:bg-blue-900 transition duration-300 ease-in-out"
                    onClick={() => handleOpenServicesModal(service)}
                  >
                    <p>
                      {service.name} - ${service.price}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-bold block mb-2 text-blue-800">Past Work:</label>
              <div className="overflow-x-auto whitespace-nowrap">
                <div className="flex">
                  {artist.portfolio.slice(0, 3).map((imageUrl, imageIndex) => (
                    <button
                      key={imageIndex}
                      onClick={() => handleOpenModal(imageUrl)}
                      className="m-1"
                    >
                      <img
                        src={imageUrl}
                        alt={`Portfolio item ${imageIndex + 1}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-800 transition duration-300 ease-in-out block w-full"
              onClick={() => navigate("/contact", { state: { artist } })}
            >
              Contact
            </button>
          </div>
        </div>
      ))}
    </div>
    {modalImage && (
      <ImageModal imageUrl={modalImage} onClose={handleCloseModal} />
    )}
    {showServicesModal && services && (
      <ServiceModal service={services} onClose={handleCloseServicesModal} />
    )}
  </div>
  );
};

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-3xl max-h-full overflow-auto">
        <img
          src={imageUrl}
          alt="Enlarged art"
          className="w-full max-w-3xl h-auto object-contain"
        />
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-red-500 text-white text-lg rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ServiceModal = ({ service, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex justify-center items-center z-50">
      <div className="bg-white p-12 rounded-lg w-3/4 max-w-4xl max-h-full overflow-auto shadow-xl">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          Service Details
        </h2>
        <div className="text-lg text-blue-800 font-semibold mb-4">
          <p>{service.name} - ${service.price.toFixed(2)}</p>
        </div>
        <p className="text-blue-700 text-md mb-8 leading-relaxed">
          {service.description}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-8 py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-800 transition-colors duration-300 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  );
};


ServiceModal.propTypes = {
  service: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export { ServiceModal };

export default ProfessionalArtist;
