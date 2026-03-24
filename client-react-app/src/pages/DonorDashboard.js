import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { caseService } from "../services/caseService";
import { donationService } from "../services/donationService";
import { formatPkr } from "../utils/formatPkr";
import { humanizeStatus } from "../utils/humanizeStatus";

const DonorDashboard = () => {
  const [cases, setCases] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, donationsRes] = await Promise.all([
        caseService.getPublicCases(1, 6),
        donationService.getMyDonations(),
      ]);
      if (casesRes.success) setCases(casesRes.data.cases);
      if (donationsRes.success) setDonations(donationsRes.data.donations);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Donor Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Browse Cases</h2>
          <div className="space-y-4">
            {cases.length === 0 ? (
              <p className="text-gray-600">No cases available</p>
            ) : (
              cases.map((caseItem) => (
                <Link
                  key={caseItem._id}
                  to={`/cases/${caseItem._id}`}
                  className="block bg-white p-4 rounded-lg shadow hover:shadow-md"
                >
                  <h3 className="font-semibold">{caseItem.applicantName}</h3>
                  <p className="text-sm text-gray-600">{caseItem.city}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {formatPkr(caseItem.amountRaised)} / {formatPkr(caseItem.amountRequired)}
                      </span>
                      <span>
                        {Math.round(
                          (caseItem.amountRaised / caseItem.amountRequired) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (caseItem.amountRaised / caseItem.amountRequired) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link
            to="/cases"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            View All Cases →
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">My Donations</h2>
          <div className="space-y-4">
            {donations.length === 0 ? (
              <p className="text-gray-600">No donations yet</p>
            ) : (
              donations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {donation.caseId?.applicantName || "Case"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: {formatPkr(donation.pledgedAmount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {humanizeStatus(donation.status)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        donation.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : donation.status === "pending_verification"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {humanizeStatus(donation.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;

