
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [userType, setUserType] = useState(localStorage.getItem("type"));

  useEffect(() => {
    // Update localStorage when user changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Add useEffect for userType
  useEffect(() => {
    // Update localStorage when userType changes
    localStorage.setItem("type", userType);
  }, [userType]);

  const isLoggedIn = useMemo(() => !!user, [user]);

  const login = (userData) => {
    setUser(userData.user); // Store user data on login
  };

  const category = (type) => {
    setUserType(type); // Update the userType state, localStorage will be updated by useEffect
  };

  const logout = () => {
    setUser(null); // Clear user data on logout
    setUserType(null); // Clear user type
    // Also, clear localStorage for both user and type
    deleteFileContent();
    localStorage.removeItem("user");
    localStorage.removeItem("type");
  };

  const deleteFileContent = async () => {
    try {
      // Delete content of db.json
      await fetch("http://localhost:3000/deleteFileContent", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting file content:", error);
      // Handle error appropriately
    }
  };




  const updateUser = async (updatedDetails) => {
    try {
      const response = await fetch(
        `http://localhost:3000/updateUser/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedDetails),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update user details");
      }
      const updatedUser = await response.json();
      setUser(updatedUser); // Update user in context and localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle error appropriately
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, updateUser, category, userType }}
    >
      {children}
    </AuthContext.Provider>
  );
};
