import api from "../config/api";

export const caseService = {
  createCase: async (formData) => {
    const response = await api.post("/cases", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getPublicCases: async (page = 1, limit = 10) => {
    const response = await api.get("/cases/public", {
      params: { page, limit },
    });
    return response.data;
  },

  getCaseById: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  updateCase: async (id, formData) => {
    const response = await api.put(`/cases/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getMyCases: async () => {
    const response = await api.get("/cases/my/cases");
    return response.data;
  },
};

