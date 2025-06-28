import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      `API error: ${err.response?.status || "unknown"} ${err.message}`;
    return Promise.reject(new Error(msg));
  }
);

export default apiClient;
