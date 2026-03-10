import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { caseService } from "../services/caseService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const caseSchema = z.object({
  applicantName: z.string().min(2),
  phone: z.string().min(10),
  cnic: z.string().min(13),
  city: z.string().min(2),
  address: z.string().min(10),
  familyMembers: z.number().min(1),
  dependents: z.string().min(1),
  income: z.number().min(0),
  expenses: z.number().min(0),
  description: z.string().min(50).max(5000),
  amountRequired: z.number().positive(),
});

const DoneeDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(caseSchema),
  });

  useEffect(() => {
    fetchMyCases();
  }, []);

  const fetchMyCases = async () => {
    setLoading(true);
    try {
      const response = await caseService.getMyCases();
      if (response.success) {
        setCases(response.data.cases);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "images" || key === "documents") {
          // Handle file arrays
          if (data[key] && data[key].length > 0) {
            Array.from(data[key]).forEach((file) => {
              formData.append(key, file);
            });
          }
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await caseService.createCase(formData);
      if (response.success) {
        alert("Case submitted successfully!");
        reset();
        setShowForm(false);
        fetchMyCases();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit case");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      peer_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      funded: "bg-purple-100 text-purple-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donee Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          {showForm ? "Cancel" : "Submit New Case"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Submit Case Application</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  {...register("applicantName")}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.applicantName && (
                  <p className="text-red-600 text-sm">{errors.applicantName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  {...register("phone")}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CNIC *</label>
                <input
                  {...register("cnic")}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.cnic && (
                  <p className="text-red-600 text-sm">{errors.cnic.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input
                  {...register("city")}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm">{errors.city.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address *</label>
                <textarea
                  {...register("address")}
                  rows="2"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Family Members *
                </label>
                <input
                  {...register("familyMembers", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.familyMembers && (
                  <p className="text-red-600 text-sm">
                    {errors.familyMembers.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dependents *</label>
                <input
                  {...register("dependents")}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.dependents && (
                  <p className="text-red-600 text-sm">{errors.dependents.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Income ($) *</label>
                <input
                  {...register("income", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.income && (
                  <p className="text-red-600 text-sm">{errors.income.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expenses ($) *
                </label>
                <input
                  {...register("expenses", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.expenses && (
                  <p className="text-red-600 text-sm">{errors.expenses.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description * (min 50 characters)
                </label>
                <textarea
                  {...register("description")}
                  rows="5"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount Required ($) *
                </label>
                <input
                  {...register("amountRequired", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md"
                />
                {errors.amountRequired && (
                  <p className="text-red-600 text-sm">
                    {errors.amountRequired.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Supporting Images
                </label>
                <input
                  {...register("images")}
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Documents</label>
                <input
                  {...register("documents")}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Case"}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">My Cases</h2>
        {cases.length === 0 ? (
          <p className="text-gray-600">No cases submitted yet</p>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem._id}
                className="bg-white p-6 rounded-lg shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{caseItem.applicantName}</h3>
                    <p className="text-gray-600">{caseItem.city}</p>
                    <p className="text-gray-700 mt-2">{caseItem.description}</p>
                    <div className="mt-4">
                      <p className="text-sm">
                        Amount: ${caseItem.amountRaised} / $
                        {caseItem.amountRequired}
                      </p>
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
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoneeDashboard;

