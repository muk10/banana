import api from "../config/api";

export const donationService = {
  pledgeDonation: async (caseId, pledgedAmount) => {
    const response = await api.post("/donations/pledge", {
      caseId,
      pledgedAmount,
    });
    return response.data;
  },

  uploadPaymentProof: async (donationId, file) => {
    const formData = new FormData();
    formData.append("paymentProof", file);
    const response = await api.post(
      `/donations/${donationId}/upload-proof`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getMyDonations: async () => {
    const response = await api.get("/donations/my");
    return response.data;
  },
};

