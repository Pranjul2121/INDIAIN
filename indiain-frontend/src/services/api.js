import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token")

  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
return req;
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API