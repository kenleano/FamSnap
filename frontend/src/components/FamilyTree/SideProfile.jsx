import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const SideProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Navigate to the login page after logout
  };
  return (
    <div>
      {user ? (
        <div>
          <p>
            {user.firstName} {user.lastName}
          </p>
          <p>
            {new Date(user.birthday).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div>
            <button className="m-3">Profile</button>
            <button className="m-3">Edit</button>
            <button className="m-3">Delete</button>
          </div>
          <button>Photos</button>
          <br />
          <button>Biography</button>
          <br />
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default SideProfile;
