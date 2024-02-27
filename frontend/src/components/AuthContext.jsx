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
  }
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    // Update localStorage when user changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const isLoggedIn = useMemo(() => !!user, [user]);

  const login = (userData) => {
    setUser(userData.user); // Store user data on login
  };

  const logout = () => {
    setUser(null); // Clear user data on logout
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
      value={{ user, isLoggedIn, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
