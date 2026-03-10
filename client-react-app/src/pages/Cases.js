import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { caseService } from "../services/caseService";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await caseService.getPublicCases(page, 10);
      if (response.success) {
        setCases(response.data.cases);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p>Loading cases...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Verified Cases</h1>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No cases available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <Link
              key={caseItem._id}
              to={`/cases/${caseItem._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {caseItem.images && caseItem.images.length > 0 && (
                <img
                  src={caseItem.images[0].url}
                  alt={caseItem.applicantName}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{caseItem.applicantName}</h3>
                <p className="text-gray-600 mb-2">{caseItem.city}</p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {caseItem.description}
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Raised</span>
                    <span className="font-semibold">
                      ${caseItem.amountRaised?.toLocaleString()} / $
                      {caseItem.amountRequired?.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                <button className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Cases;

