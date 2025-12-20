import { createContext, useContext, useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios'; // Make sure this path is correct

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in when the app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/verify');
        if (data.authenticated) {
          setUser(data.user); // Sets user: { id: "...", role: "student" }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Login function (updates state manually after successful API login)
  const login = (userData) => {
    setUser(userData);
  };

  // 3. Logout function
  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      // Optional: Refresh page to clear any local state artifacts
      window.location.href = '/'; 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);