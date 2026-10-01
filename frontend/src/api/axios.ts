import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 401 = the account was deactivated while the user was logged in.
// Log the user out and show the reason on the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem("token")
    ) {
      const message = error.response?.data?.message;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");

      if (message) {
        sessionStorage.setItem("civicconnect.loginNotice", message);
      }

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;