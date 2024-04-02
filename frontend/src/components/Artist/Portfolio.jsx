import React, { useEffect, useState } from "react";
import ArtistUpload from "./ArtistUpload";
import { useAuth } from "../AuthContext";
import axios from "axios";

const Portfolio = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    fetchPortfolio();
  }, [user.id]);

  const fetchPortfolio = () => {
    axios
      .get(`http://localhost:3000/getPortfolio/${user.id}`)
      .then((response) => {
        setPortfolio(response.data);
      })
      .catch((error) =>
        console.error("There was an error fetching the portfolio:", error)
      );
  };

  const handleDeleteImage = (index) => {
    const imageUrl = portfolio[index];
    axios
      .delete(`http://localhost:3000/deletePortfolio/${user.id}/${index}`)
      .then((response) => {
        console.log(response.data.message); // Optional: Log success message
        fetchPortfolio(); // Refresh portfolio after deletion
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <div 
        className="flex items-center justify-between cursor-pointer border-b border-gray-200 pb-2 mb-4"
        onClick={toggleVisibility}
      >
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-200 ${!isVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {!isVisible && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.map((item, index) => (
              <div key={index} className="relative">
                <img src={item} alt={`Portfolio item ${index + 1}`} className="w-full object-cover h-48" />
                <button onClick={() => handleDeleteImage(index)} className="absolute top-2 right-2 text-red-600 hover:text-red-800 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <br/>
          <ArtistUpload />
        </div>
      )}
    </div>
  );
};

export default Portfolio;
