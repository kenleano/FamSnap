import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust the import path as needed

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Hook for navigation

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]); // Depend on 'user' to trigger redirection when it changes

  // Conditional rendering based on 'user' being present
  return (
    <nav>
      {user ? (
        <div>
          <span>Welcome, {user.firstName}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>Loading...</div> // This will not be shown due to the redirect, but it's good to handle the null state
      )}
    </nav>
  );
};

export default Profile;
