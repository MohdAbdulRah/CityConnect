// components/authApi.js   ← NEW FILE
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./api"; // your original API

// Reuse the same baseURL
const authApi = axios.create({
  baseURL: API.defaults.baseURL,
  headers: API.defaults.headers,
});

// THIS IS THE MAGIC: Add token automatically
authApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authApi;