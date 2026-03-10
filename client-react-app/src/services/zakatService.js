import api from "../config/api";

export const zakatService = {
  calculateZakat: async (data) => {
    const response = await api.post("/zakat/calculate", data);
    return response.data;
  },
};

