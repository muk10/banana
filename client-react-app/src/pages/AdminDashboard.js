import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { adminService } from "../services/adminService";
import { formatPkr } from "../utils/formatPkr";
import { humanizeStatus } from "../utils/humanizeStatus";

const CASE_STATUS_LABELS = {
  pending: "Pending review",
  peer_review: "In review",
  under_admin_review: "More information needed",
  approved: "Approved",
  rejected: "Declined",
  funded: "Fully funded",
};

const caseStatusLabel = (status) =>
  CASE_STATUS_LABELS[status] || humanizeStatus(status);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [casesPayload, setCasesPayload] = useState(null);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesPage, setCasesPage] = useState(1);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const response = await adminService.getReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchAdminCases = useCallback(async () => {
    setCasesLoading(true);
    try {
      const response = await adminService.getAdminCases(casesPage, 50);
      if (response.success) {
        setCasesPayload(response.data);
      }
    } catch (error) {
      console.error("Error fetching admin cases:", error);
    } finally {
      setCasesLoading(false);
    }
  }, [casesPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (activeTab === "cases") {
      fetchAdminCases();
    }
  }, [activeTab, fetchAdminCases]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const casesByStatusChart = (reports?.casesByStatus || []).map((row) => ({
    ...row,
    statusLabel: humanizeStatus(row._id),
  }));

  const donationsByStatusChart = (reports?.donationsByStatus || []).map((row) => ({
    ...row,
    statusLabel: humanizeStatus(row._id),
  }));

  const adminCases = casesPayload?.cases || [];
  const casesPagination = casesPayload?.pagination;

  const caseStatusBadgeClass = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      peer_review: "bg-blue-100 text-blue-800",
      under_admin_review: "bg-orange-100 text-orange-900",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      funded: "bg-purple-100 text-purple-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "overview"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cases")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "cases"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Cases
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {reportsLoading && (
            <div className="text-center py-12 text-gray-600">Loading overview...</div>
          )}
          {!reportsLoading && !reports && (
            <div className="text-center py-12 text-gray-600">Could not load overview data.</div>
          )}
          {reports && (
            <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Total Donations</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatPkr(reports.summary?.totalDonations)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Active Cases</h3>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary?.activeCases || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Funded Cases</h3>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary?.fundedCases || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Total Donors</h3>
              <p className="text-2xl font-bold text-gray-900">
                {reports.summary?.donorCount || 0}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Cases by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={casesByStatusChart}
                    dataKey="count"
                    nameKey="statusLabel"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {casesByStatusChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Donations by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationsByStatusChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="statusLabel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                  <Bar dataKey="totalAmount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Case
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(reports.recentDonations || []).map((donation) => (
                    <tr key={donation._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.donorId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.caseId?.applicantName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPkr(donation.pledgedAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            donation.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {humanizeStatus(donation.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}
        </>
      )}

      {activeTab === "cases" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {casesLoading && (
            <div className="text-center py-12 text-gray-600">Loading cases...</div>
          )}
          {!casesLoading && adminCases.length === 0 && (
            <div className="text-center py-12 text-gray-600">No cases submitted yet.</div>
          )}
          {!casesLoading && adminCases.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Applicant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Donee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Goal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Raised
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminCases.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {c.applicantName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{c.applicantId?.name || "—"}</div>
                          <div className="text-xs text-gray-500">{c.applicantId?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.city}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${caseStatusBadgeClass(
                              c.status
                            )}`}
                          >
                            {caseStatusLabel(c.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatPkr(c.amountRequired)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatPkr(c.amountRaised)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString("en-PK", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/cases/${c._id}`}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {casesPagination && casesPagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Page {casesPagination.page} of {casesPagination.pages} (
                    {casesPagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={casesPagination.page <= 1}
                      onClick={() => setCasesPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={casesPagination.page >= casesPagination.pages}
                      onClick={() =>
                        setCasesPage((p) =>
                          Math.min(casesPagination.pages, p + 1)
                        )
                      }
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

