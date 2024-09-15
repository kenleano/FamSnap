import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import RequestUpload from "../Restoration/RequestUpload";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import Watermark from "@uiw/react-watermark";
import { useNavigate } from "react-router-dom";

const UserRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [artistEmail, setArtistEmail] = useState(""); // State to store artist's email
  const navigate = useNavigate();

  //Fetch Artist Details
  const getArtistEmail = async (artistId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/getArtist/${artistId}`
      );
      setArtistEmail(response.data.email); // Set artist's email in state
    } catch (error) {
      console.error("Failed to fetch artist details:", error);
    }
  };

  useEffect(() => {
    axios
      .get(`http://localhost:3000/getUserRequests/${user.id}`)
      .then((response) => {
        setRequests(response.data);
      })
      .catch((error) =>
        console.error("There was an error fetching the requests:", error)
      );
  }, [user.id]);

  const handleStatusChange = (index, value) => {
    const updatedRequests = [...requests];
    updatedRequests[index].status = value;
    setRequests(updatedRequests);
  };

  const saveChanges = (request, index) => {
    axios
      .post(`http://localhost:3000/updateRequest/${request._id}`, {
        ...request,
      })
      .then(() => {
        alert("Request updated successfully!");
      })
      .catch((error) => {
        console.error("There was an error updating the request:", error);
      });
  };

  const handlePurchaseClick = (amount, afterImage, requestId) => {
    // Navigate to /payment and pass imageUrl as state
    navigate("/payRequest", { state: { amount, afterImage, requestId } });
  };

  const handleUploadSuccess = (url, index) => {
    const updatedRequests = [...requests];
    updatedRequests[index].afterImage = url;
    setRequests(updatedRequests);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold text-center mb-6">Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border-2 overflow-hidden "
          >
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2">
                Artist: {request.artistName}
              </h3>
              <ul className="mb-4">
                <li>
                  <strong>Date:</strong>{" "}
                  {new Date(request.date).toLocaleDateString()}
                </li>
                <li>
                  <strong>Service:</strong> {request.serviceName}
                </li>
                <li>
                  <strong>Price:</strong> ${request.servicePrice}
                </li>
                <li>
                  {(request.status === "Pending" ||
                    request.status === "Cancelled") && (
                    <>
                      <strong>Status:</strong>
                      <select
                        value={request.status}
                        onChange={(e) =>
                          handleStatusChange(index, e.target.value)
                        }
                        className="ml-2 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </>
                  )}

                  {(request.status === "Delivered" ||
                    request.status === "Paid") && (
                    <>
                      <strong>Status:</strong>
                      <span> {request.status}</span>
                    </>
                  )}
                </li>
              </ul>
              {(request.status === "Pending" ||
                request.status === "Cancelled") && (
                <div className="mb-4">
                  <strong>Before Image:</strong>
                  <img
                    src={request.beforeImage}
                    alt="Before Restoration"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="mt-2">
                    <RequestUpload
                      onUploadSuccess={(url) => handleUploadSuccess(url, index)}
                    />
                  </div>
                </div>
              )}
              {(request.status == "Delivered" || request.status == "Paid") && (
                <div className="mb-4">
                  <strong>Before & After Image:</strong>
                  <ReactCompareSlider
                    itemOne={
                      <ReactCompareSliderImage
                        src={request.beforeImage}
                        alt="Before Restoration"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    }
                    itemTwo={
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
                          src={request.afterImage}
                          alt="After Restoration"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </Watermark>
                    }
                  />
                  {request.status == "Paid" && (
                    <a
                      href={request.afterImage}
                      download="BeforeImage.jpg"
                      className="inline-block mt-2"
                    >
                      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                        Download Image
                      </button>
                    </a>
                  )}
                </div>
              )}
              {(request.status === "Pending" ||
                request.status === "Cancelled") && (
                <button
                  onClick={() => saveChanges(request, index)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Save Changes
                </button>
              )}
              {request.status !== "Paid" && request.status === "Delivered" && (
                <>
                  <button
                    onClick={() => {
                      const subject = request.serviceName + " Service Inquiry";
                      const body = "Hello, I would like to discuss further details about the service.";
                      const mailtoLink = `mailto:${artistEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoLink);
                    }}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                  >
                    Email Artist 
                  </button>
                  <button
                    onClick={() =>
                      handlePurchaseClick(
                        request.servicePrice,
                        request.afterImage,
                        request._id
                      )
                    }
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mx-4 rounded transition duration-300 ease-in-out"
                  >
                    Pay $ {request.servicePrice}
                  </button>
                </>
              )}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRequests;
