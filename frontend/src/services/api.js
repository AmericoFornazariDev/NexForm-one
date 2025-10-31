import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const getProfile = () => api.get("/profile");

export const getForms = () => api.get("/forms");

export const getFormResponses = (formId) =>
  api.get(`/forms/${formId}/responses`);
