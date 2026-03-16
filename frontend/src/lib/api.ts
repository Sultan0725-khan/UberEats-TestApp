import axios from "axios";

// The base URL points to our local backend server
const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Generic helper for the app to communicate with our Express proxy
export default api;
