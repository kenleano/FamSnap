import React from 'react';
import { useAuth } from '../AuthContext';

const SideProfile = () => {
    const { user, logout } = useAuth();
  
    return (
      <div>
        {user ? (
          <div>
            <p>Welcome, {user.firstName} {user.lastName}!</p>
            <p>Birthday: {user.birthday}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <p>Please log in.</p>
        )}
      </div>
    );
  };
  

export default SideProfile;