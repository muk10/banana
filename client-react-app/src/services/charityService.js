import api from "../config/api";

export const charityService = {
  calculateCharity: async (data) => {
    const response = await api.post("/charity/calculate", data);
    return response.data;
  },
};

