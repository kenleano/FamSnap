import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const ArtistSidePanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const defaultProfileImg = "https://img.freepik.com/free-vector/smiling-woman-standing-near-easel-painting-flat-illustration_74855-11057.jpg?size=626&ext=jpg&ga=GA1.1.1224184972.1711929600&semt=sph";
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImg: defaultProfileImg, // Assume there's a default profile image
  });

  useEffect(() => {
    if (user && user.id) {
      axios.get(`http://localhost:3000/getArtist/${user.id}`)
        .then(response => {
          const { firstName, lastName, email, birthday, profileImg } = response.data;
          setUserData({
            firstName,
            lastName,
            email,
            birthday: birthday ? birthday.split("T")[0] : "",
            profileImg: profileImg || defaultProfileImg,
          });
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    // Navigate to login page after logout
    navigate("/login");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <img
          src={userData.profileImg}
          alt="Profile"
          className="mx-auto h-32 w-32 rounded-full object-cover"
        />
        <h2 className="mt-4 font-bold text-xl">{userData.firstName} {userData.lastName}</h2>
        <p className="text-gray-600">{userData.email}</p>
      </div>
      <div className="mt-4 space-y-2">
        
        {/* Additional profile details here */}
      </div>
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300 ease-in-out"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ArtistSidePanel;
