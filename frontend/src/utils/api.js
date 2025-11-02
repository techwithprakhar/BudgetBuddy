import axios from "axios"

// Create axios instance with base configuration
// For Create React App, use REACT_APP_ prefix
// Make sure to use http:// for localhost, not https://
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Centralized request interceptor to set Authorization header from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
