import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { charityService } from "../services/charityService";

const charitySchema = z.object({
  savings: z.number().min(0).default(0),
  gold: z.number().min(0).default(0),
  silver: z.number().min(0).default(0),
  investments: z.number().min(0).default(0),
  debts: z.number().min(0).default(0),
});

const CharityCalculator = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(charitySchema),
    defaultValues: {
      savings: 0,
      gold: 0,
      silver: 0,
      investments: 0,
      debts: 0,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await charityService.calculateCharity(data);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Charity Calculator</h1>
        <p className="text-gray-600">
          Calculate your Charity obligation based on your wealth
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Enter Your Assets</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Savings ($)</label>
              <input
                {...register("savings", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gold Value ($)</label>
              <input
                {...register("gold", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Silver Value ($)</label>
              <input
                {...register("silver", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Investments ($)
              </label>
              <input
                {...register("investments", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Debts ($)</label>
              <input
                {...register("debts", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate Charity"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Calculation Result</h2>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Total Wealth:</span>
                  <span className="font-semibold">
                    ${result.totalWealth?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Debts:</span>
                  <span className="font-semibold">
                    ${result.debts?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Eligible Wealth:</span>
                  <span className="font-semibold">
                    ${result.eligibleWealth?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Nisab Value:</span>
                  <span className="font-semibold">
                    ${result.nisabValue?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Charity Amount</p>
                  <p className="text-3xl font-bold text-primary-700">
                    ${result.charityAmount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    ({result.charityPercentage}% of eligible wealth)
                  </p>
                </div>
              </div>

              {!result.meetsNisab && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">
                    Your wealth does not meet the nisab threshold. No Charity is due.
                  </p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">Note:</p>
                <p>
                  Charity is calculated as 2.5% of your eligible wealth (total assets minus
                  debts) if it meets or exceeds the nisab threshold.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Enter your assets and click "Calculate Charity" to see the result.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharityCalculator;

