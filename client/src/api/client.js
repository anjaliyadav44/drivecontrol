import axios from "axios";
import demoApi from "./demoApi.js";

function liveApi() {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("dc_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const here = `${window.location.pathname}${window.location.hash}`;
      if (err.response?.status === 401 && !here.includes("login")) {
        localStorage.removeItem("dc_token");
      }
      return Promise.reject(err);
    }
  );

  return api;
}

const api = import.meta.env.VITE_DEMO === "true" ? demoApi : liveApi();
export default api;
