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

    return (
      <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
