import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import RequestUpload from "../Restoration/RequestUpload";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/getRequests/${user.id}`)
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
            className="bg-white rounded-lg overflow-hidden border hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2">
                Name: {request.userName}
              </h3>
              <ul className="mb-6">
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
                  <strong>Status:</strong>
                  {request.status != "Paid" && (
                    <select
                      value={request.status}
                      onChange={(e) =>
                        handleStatusChange(index, e.target.value)
                      }
                      className="ml-2 border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}

                  {request.status == "Paid" && (
         <span className={request.status === "Paid" ? "text-green-600 font-bold" : ""}> {request.status}</span>

                  )}
                </li>
                <li>
                  <strong>Message:</strong> {request.message}
                </li>
              </ul>
              {!request.afterImage && (
                <div className="mb-4">
                  <strong>Before Image:</strong>
                  <img
                    src={request.beforeImage}
                    alt="Before Restoration"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <a
                    href={request.beforeImage}
                    download="BeforeImage.jpg"
                    className="inline-block mt-2"
                  >
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                      Download Image
                    </button>
                  </a>
                </div>
              )}
              {request.afterImage && (
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
                      <ReactCompareSliderImage
                        src={request.afterImage}
                        alt="After Restoration"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    }
                  />
                </div>
              )}
              {request.status != "Paid"  && (
                <>
                  <RequestUpload
                    onUploadSuccess={(url) => handleUploadSuccess(url, index)}
                  />

                  <button
                    onClick={() => saveChanges(request, index)}
                    className="mt-2 mx-2  bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                  >
                    Save Changes
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

export default Requests;
