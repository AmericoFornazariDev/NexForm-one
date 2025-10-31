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
export const createForm = (payload) => api.post("/forms", payload);
export const deleteForm = (formId) => api.delete(`/forms/${formId}`);

export const getFormResponses = (formId) =>
  api.get(`/forms/${formId}/responses`);

export const getPublicForm = (formId) => api.get(`/forms/${formId}`);

export const respondToPublicForm = (formId, userInput) =>
  api.post(`/forms/${formId}/respond`, { user_input: userInput });

export const getAIConfig = () => api.get("/ai/config");
export const saveAIConfig = (payload) => api.post("/ai/config", payload);

export const getFormDetails = (formId) => api.get(`/forms/${formId}`);
export const getFormQuestions = (formId) =>
  api.get(`/forms/${formId}/questions`);
export const createFormQuestion = (formId, payload) =>
  api.post(`/forms/${formId}/questions`, payload);
export const updateQuestion = (questionId, payload) =>
  api.put(`/questions/${questionId}`, payload);
export const deleteQuestion = (questionId) => api.delete(`/questions/${questionId}`);
