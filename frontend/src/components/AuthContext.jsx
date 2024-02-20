import React, { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext();


export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(null);

  // Determine if user is logged in based on if the user state is not null
  const isLoggedIn = useMemo(() => !!user, [user]);

  const login = (userData) => setUser(userData.user); 
 // Store user data on login
  const logout = () => setUser(null); // Clear user data on logout

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
