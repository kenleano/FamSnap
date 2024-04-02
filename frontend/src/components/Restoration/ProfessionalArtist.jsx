import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ProfessionalArtist = () => {
  const [artists, setArtists] = useState([]);
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

    // Cleanup function
    return () => {
      //cleanup
    };
  }, []);

  const [modalImage, setModalImage] = useState(null);

  const handleOpenModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  return (
    <div className="min-h-screen w-full bg-blue-50 px-16 py-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-900">
        Professional Artists
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist, index) => (
          <div
            key={index}
            className="flex flex-col bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out"
          >
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-xl mb-4 text-blue-800">
                  {artist.firstName} {artist.lastName}
                </h3>
                <div className="mb-4">
                  <label className="font-bold block mb-2 text-blue-800">Services:</label>
                  <div className="flex flex-wrap mt-2">
                    {artist.services.slice(0, 3).map((service, serviceIndex) => (
                      <p
                        key={serviceIndex}
                        className="mr-4 mb-2 bg-blue-100 text-blue-700 font-semibold py-1 px-2 rounded"
                      >
                        {service.name} - ${service.price}
                      </p>
                    ))}
                  </div>
                  {artist.services.length > 3 && (
                    <button
                      className="text-blue-500 font-semibold mt-2 inline-block"
                      onClick={() => navigate("/services", { state: { artist } })}
                    >
                      View More Services
                    </button>
                  )}
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
    </div>
  );
  
      };  

const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-lg max-h-full overflow-auto">
        <img
          src={imageUrl}
          alt="Enlarged art"
          className="w-full object-contain"
        />
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfessionalArtist;
