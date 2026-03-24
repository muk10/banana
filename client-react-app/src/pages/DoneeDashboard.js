import { useState, useEffect } from "react";
import { caseService } from "../services/caseService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const caseSchema = z.object({
  applicantName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  cnic: z.string().min(13, "CNIC must be at least 13 characters"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  familyMembers: z.coerce.number().int().min(1, "Family members must be at least 1"),
  dependents: z.string().min(1, "Dependents information is required"),
  income: z.coerce.number().min(0, "Income cannot be negative"),
  expenses: z.coerce.number().min(0, "Expenses cannot be negative"),
  description: z.string().min(50).max(5000, "Description must be 50–5000 characters"),
  amountRequired: z.coerce.number().positive("Amount must be greater than 0"),
});

/** Maps API `body.fieldName` paths to react-hook-form field names */
const apiFieldToFormName = (field) =>
  field.startsWith("body.") ? field.slice(5) : field;

const friendlyServerMessage = (message) => {
  if (message === "Expected number, received string") {
    return "Please enter a valid number.";
  }
  return message;
};

const DoneeDashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
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

  const normalizeIntOnBlur = (fieldName) => (e) => {
    const raw = e.target.value.trim();
    if (raw === "" || raw === "-") return;
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) {
      setValue(fieldName, n, { shouldValidate: true, shouldDirty: true });
    }
  };

  const normalizeDecimalOnBlur = (fieldName) => (e) => {
    const raw = e.target.value.trim();
    if (raw === "" || raw === "-") return;
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) {
      setValue(fieldName, n, { shouldValidate: true, shouldDirty: true });
    }
  };

  const applyServerValidationErrors = (errorList) => {
    const unknown = [];
    let fieldErrorCount = 0;
    if (!Array.isArray(errorList)) {
      return { fieldErrorCount: 0, unknownMessages: unknown };
    }
    const keys = Object.keys(caseSchema.shape);
    errorList.forEach(({ field, message }) => {
      const name = apiFieldToFormName(field);
      const text = friendlyServerMessage(message);
      if (keys.includes(name)) {
        setError(name, { type: "server", message: text });
        fieldErrorCount += 1;
      } else {
        unknown.push(text);
      }
    });
    return { fieldErrorCount, unknownMessages: unknown };
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    clearErrors();
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
      const payload = error.response?.data;
      const serverErrors = payload?.errors;
      if (serverErrors?.length) {
        const { fieldErrorCount, unknownMessages } =
          applyServerValidationErrors(serverErrors);
        const parts = [];
        if (unknownMessages.length) {
          parts.push(unknownMessages.join(" "));
        }
        if (fieldErrorCount > 0) {
          parts.push("Please correct the highlighted fields and try again.");
        }
        if (parts.length === 0 && payload?.message) {
          parts.push(payload.message);
        }
        setSubmitError(
          parts.length > 0
            ? parts.join(" ")
            : payload?.message ||
                "We could not save your case. Please check your information and try again."
        );
      } else {
        setSubmitError(
          payload?.message ||
            error.message ||
            "Failed to submit case. Please try again."
        );
      }
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

  const familyMembersField = register("familyMembers", { valueAsNumber: true });
  const incomeField = register("income", { valueAsNumber: true });
  const expensesField = register("expenses", { valueAsNumber: true });
  const amountRequiredField = register("amountRequired", { valueAsNumber: true });

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
            {submitError && (
              <div
                className="rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm"
                role="alert"
              >
                {submitError}
              </div>
            )}
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
                  {...familyMembersField}
                  onBlur={(e) => {
                    familyMembersField.onBlur(e);
                    normalizeIntOnBlur("familyMembers")(e);
                  }}
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
                  {...incomeField}
                  onBlur={(e) => {
                    incomeField.onBlur(e);
                    normalizeDecimalOnBlur("income")(e);
                  }}
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
                  {...expensesField}
                  onBlur={(e) => {
                    expensesField.onBlur(e);
                    normalizeDecimalOnBlur("expenses")(e);
                  }}
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
                  {...amountRequiredField}
                  onBlur={(e) => {
                    amountRequiredField.onBlur(e);
                    normalizeDecimalOnBlur("amountRequired")(e);
                  }}
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

