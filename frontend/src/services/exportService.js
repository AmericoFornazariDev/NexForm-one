import { api } from "./api";

export const getGlobalReport = () => api.get("/export/global");

export const exportPDF = (formId) => {
  const base = api.defaults.baseURL?.replace(/\/$/, "") ?? "";
  window.open(`${base}/export/form/${formId}/pdf`, "_blank");
};

export const exportCSV = (formId) => {
  const base = api.defaults.baseURL?.replace(/\/$/, "") ?? "";
  window.open(`${base}/export/form/${formId}/csv`, "_blank");
};
