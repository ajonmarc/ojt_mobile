import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../axios";
import Constants from "expo-constants";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = Constants.expoConfig?.extra?.apiUrl;

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedUser = await AsyncStorage.getItem("user");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        { email, password },
        { timeout: 8000 }
      );
      console.log("Response:", response.status, response.data);
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.log("Error:", error.response?.status, error.response?.data);
      if (error.response) {
        if (error.response.status === 422) {
          return { success: false, errors: error.response.data.errors };
        }
        if (error.response.status === 401) {
          return { success: false, error: "Invalid email or password." };
        }
        return {
          success: false,
          error: "An unexpected server error occurred.",
        };
      } else if (error.request) {
        return {
          success: false,
          error: "No response from server. Please check your internet connection.",
        };
      } else {
        return {
          success: false,
          error: "Something went wrong. Please try again later.",
        };
      }
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("/logout");
      console.log("Logout response:", response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Logout failed:", JSON.stringify(error, null, 2));
      }
    }

    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);