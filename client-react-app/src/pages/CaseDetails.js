import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { caseService } from "../services/caseService";
import { donationService } from "../services/donationService";
import useAuthStore from "../store/authStore";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const response = await caseService.getCaseById(id);
      if (response.success) {
        setCaseItem(response.data.case);
      }
    } catch (error) {
      console.error("Error fetching case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePledge = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== "donor") {
      navigate("/login");
      return;
    }

    setDonating(true);
    try {
      const response = await donationService.pledgeDonation(
        id,
        parseFloat(pledgeAmount)
      );
      if (response.success) {
        setDonationId(response.data.donation._id);
        alert("Donation pledged! Please upload payment proof.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to pledge donation");
    } finally {
      setDonating(false);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!proofFile || !donationId) return;

    setDonating(true);
    try {
      const response = await donationService.uploadPaymentProof(
        donationId,
        proofFile
      );
      if (response.success) {
        alert("Payment proof uploaded! Waiting for admin verification.");
        setProofFile(null);
        fetchCase();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to upload proof");
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p>Loading case details...</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p>Case not found</p>
      </div>
    );
  }

  const progress = caseItem.amountRequired > 0
    ? Math.min((caseItem.amountRaised / caseItem.amountRequired) * 100, 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {caseItem.images && caseItem.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 p-4">
            {caseItem.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`Case image ${idx + 1}`}
                className="w-full h-64 object-cover rounded"
              />
            ))}
          </div>
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{caseItem.applicantName}</h1>
          <p className="text-gray-600 mb-6">{caseItem.city}</p>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-semibold">
                ${caseItem.amountRaised?.toLocaleString()} / $
                {caseItem.amountRequired?.toLocaleString()} ({progress.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary-600 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Case Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{caseItem.description}</p>
          </div>

          {caseItem.bankDetails && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Bank Details</h3>
              <p>Account Title: {caseItem.bankDetails.accountTitle}</p>
              <p>Account Number: {caseItem.bankDetails.accountNumber}</p>
              <p>Bank: {caseItem.bankDetails.bankName}</p>
              {caseItem.bankDetails.iban && <p>IBAN: {caseItem.bankDetails.iban}</p>}
            </div>
          )}

          {isAuthenticated && user?.role === "donor" && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Make a Donation</h3>
              {!donationId ? (
                <form onSubmit={handlePledge}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Pledge Amount ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={pledgeAmount}
                      onChange={(e) => setPledgeAmount(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={donating}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {donating ? "Processing..." : "Pledge Donation"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleUploadProof}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Upload Payment Proof
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files[0])}
                      className="w-full px-4 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={donating || !proofFile}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {donating ? "Uploading..." : "Upload Proof"}
                  </button>
                </form>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
              <p className="mb-4">Please login to make a donation</p>
              <button
                onClick={() => navigate("/login")}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;

