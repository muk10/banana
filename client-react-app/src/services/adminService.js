import api from "../config/api";

export const adminService = {
  getAdminCases: async (page = 1, limit = 20, status) => {
    const response = await api.get("/admin/cases", {
      params: { page, limit, status },
    });
    return response.data;
  },

  approveOrRejectCase: async (caseId, status, adminNote) => {
    const response = await api.put(`/admin/cases/${caseId}/approve`, {
      status,
      adminNote,
    });
    return response.data;
  },

  verifyDonation: async (donationId, status, adminNotes) => {
    const response = await api.put(`/admin/donations/${donationId}/verify`, {
      status,
      adminNotes,
    });
    return response.data;
  },

  getReports: async () => {
    const response = await api.get("/admin/reports");
    return response.data;
  },

  getUsers: async (page = 1, limit = 20, role) => {
    const response = await api.get("/admin/users", {
      params: { page, limit, role },
    });
    return response.data;
  },

  blockUser: async (userId, isBlocked) => {
    const response = await api.put(`/admin/users/${userId}/block`, {
      isBlocked,
    });
    return response.data;
  },
};

