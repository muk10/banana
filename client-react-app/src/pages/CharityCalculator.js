import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { charityService } from "../services/charityService";
import { formatPkr, formatNumericInputString } from "../utils/formatPkr";

const zakatSchema = z.object({
  savings: z.number().min(0).default(0),
  gold: z.number().min(0).default(0),
  silver: z.number().min(0).default(0),
  investments: z.number().min(0).default(0),
  debts: z.number().min(0).default(0),
});

const CharityCalculator = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(zakatSchema),
    defaultValues: {
      savings: 0,
      gold: 0,
      silver: 0,
      investments: 0,
      debts: 0,
    },
  });

  const normalizeDecimalBlur = (fieldName) => (e) => {
    const raw = e.target.value.trim();
    if (raw === "" || raw === "-") return;
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) {
      const rounded = Math.round(n * 100) / 100;
      setValue(fieldName, rounded, { shouldValidate: true, shouldDirty: true });
      e.target.value = formatNumericInputString(rounded);
    }
  };

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

  const savingsField = register("savings", { valueAsNumber: true });
  const goldField = register("gold", { valueAsNumber: true });
  const silverField = register("silver", { valueAsNumber: true });
  const investmentsField = register("investments", { valueAsNumber: true });
  const debtsField = register("debts", { valueAsNumber: true });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Zakat Calculator</h1>
        <p className="text-gray-600">
          Estimate your Zakat obligation based on your zakatable wealth (2.5% if above nisab).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Enter your assets (PKR)</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Savings (PKR)</label>
              <input
                {...savingsField}
                onBlur={(e) => {
                  savingsField.onBlur(e);
                  normalizeDecimalBlur("savings")(e);
                }}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gold value (PKR)</label>
              <input
                {...goldField}
                onBlur={(e) => {
                  goldField.onBlur(e);
                  normalizeDecimalBlur("gold")(e);
                }}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Silver value (PKR)</label>
              <input
                {...silverField}
                onBlur={(e) => {
                  silverField.onBlur(e);
                  normalizeDecimalBlur("silver")(e);
                }}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Investments (PKR)</label>
              <input
                {...investmentsField}
                onBlur={(e) => {
                  investmentsField.onBlur(e);
                  normalizeDecimalBlur("investments")(e);
                }}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Debts (PKR)</label>
              <input
                {...debtsField}
                onBlur={(e) => {
                  debtsField.onBlur(e);
                  normalizeDecimalBlur("debts")(e);
                }}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate Zakat"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between mb-2">
                  <span>Total wealth:</span>
                  <span className="font-semibold">{formatPkr(result.totalWealth)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Debts:</span>
                  <span className="font-semibold">{formatPkr(result.debts)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Eligible wealth:</span>
                  <span className="font-semibold">{formatPkr(result.eligibleWealth)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Nisab value:</span>
                  <span className="font-semibold">{formatPkr(result.nisabValue)}</span>
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Zakat amount</p>
                  <p className="text-3xl font-bold text-primary-700">
                    {formatPkr(result.charityAmount)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    ({result.charityPercentage}% of eligible wealth)
                  </p>
                </div>
              </div>

              {!result.meetsNisab && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">
                    Your wealth is below the nisab threshold. No Zakat is due on this estimate.
                  </p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">Note</p>
                <p>
                  Zakat is generally 2.5% of zakatable assets after deducting debts, when wealth
                  meets or exceeds nisab. Confirm with a scholar or local authority for your
                  situation.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Enter your assets in PKR and click &quot;Calculate Zakat&quot; to see the result.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharityCalculator;
