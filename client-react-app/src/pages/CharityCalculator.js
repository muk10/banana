import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  calculateZakat,
  buildZakatInput,
  safeNumber,
  computeNisabFromMetalPrices,
  REFERENCE_GOLD_PRICE_PER_GRAM_PKR_MAR_2026,
  REFERENCE_SILVER_PRICE_PER_GRAM_PKR_MAR_2026,
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
} from "../utils/calculateZakat";
import { formatPkr, formatNumericInputString } from "../utils/formatPkr";

const nonNeg = z.preprocess((val) => safeNumber(val), z.number().min(0));

const zakatFormSchema = z.object({
  cash: nonNeg,
  gold_value: nonNeg,
  silver_value: nonNeg,
  investments: nonNeg,
  business_inventory: nonNeg,
  receivables: nonNeg,
  short_term_debts: nonNeg,
  gold_price_per_gram: nonNeg,
  silver_price_per_gram: nonNeg,
});

const defaultFormValues = {
  cash: 0,
  gold_value: 0,
  silver_value: 0,
  investments: 0,
  business_inventory: 0,
  receivables: 0,
  short_term_debts: 0,
  gold_price_per_gram: REFERENCE_GOLD_PRICE_PER_GRAM_PKR_MAR_2026,
  silver_price_per_gram: REFERENCE_SILVER_PRICE_PER_GRAM_PKR_MAR_2026,
};

const CharityCalculator = () => {
  const { register, handleSubmit, control, setValue } = useForm({
    resolver: zodResolver(zakatFormSchema),
    defaultValues: defaultFormValues,
  });

  const watched = useWatch({ control });
  const goldPrice = useWatch({ control, name: "gold_price_per_gram", defaultValue: 0 });
  const silverPrice = useWatch({
    control,
    name: "silver_price_per_gram",
    defaultValue: 0,
  });

  const computedNisab = useMemo(() => {
    const g = safeNumber(goldPrice);
    const s = safeNumber(silverPrice);
    if (g > 0 && s > 0) {
      return computeNisabFromMetalPrices(g, s);
    }
    return null;
  }, [goldPrice, silverPrice]);

  const result = useMemo(() => {
    const raw = watched ?? defaultFormValues;
    const input = buildZakatInput(raw, {
      gold_price_per_gram: goldPrice,
      silver_price_per_gram: silverPrice,
    });
    return calculateZakat(input);
  }, [watched, goldPrice, silverPrice]);

  const onSubmit = () => {
    document
      .getElementById("zakat-result")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const normalizeDecimalBlur = (fieldName) => (e) => {
    const raw = e.target.value.trim();
    if (raw === "" || raw === "-") return;
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) {
      const rounded = Math.round(Math.max(0, n) * 100) / 100;
      setValue(fieldName, rounded, { shouldValidate: true, shouldDirty: true });
      e.target.value = formatNumericInputString(rounded);
    }
  };

  const field = (name) => register(name, { valueAsNumber: true });

  const cashField = field("cash");
  const goldValueField = field("gold_value");
  const silverValueField = field("silver_value");
  const investmentsField = field("investments");
  const businessInventoryField = field("business_inventory");
  const receivablesField = field("receivables");
  const shortTermDebtsField = field("short_term_debts");
  const goldPriceField = field("gold_price_per_gram");
  const silverPriceField = field("silver_price_per_gram");

  const bindBlur = (reg, name) => ({
    ...reg,
    onBlur: (e) => {
      reg.onBlur(e);
      normalizeDecimalBlur(name)(e);
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Zakat Calculator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter your zakatable assets and liabilities. Zakat is 2.5% of net wealth above the
          nisab threshold (PKR).
        </p>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-100 text-gray-700 text-sm leading-relaxed space-y-4">
        <p>
          <strong className="text-gray-900">Zakat</strong>, one of the five pillars of Islam, is
          obligatory upon every Muslim whose wealth meets or exceeds the{" "}
          <strong className="text-gray-900">nisab</strong> threshold.
        </p>
        <p>
          <strong className="text-gray-900">Nisab</strong> is the minimum amount of net capital a
          Muslim must possess to be eligible to pay Zakat. It is defined as the equivalent of{" "}
          <strong>{NISAB_GOLD_GRAMS} grams</strong> (7.5 tola) of gold and{" "}
          <strong>{NISAB_SILVER_GRAMS} grams</strong> (52.5 tola) of silver, respectively. For
          calculation, the lower of the two values (gold-based vs silver-based nisab) is typically
          used.
        </p>
        <p>
          In principle, Zakat is due only if the wealth at or above nisab has been owned for a full{" "}
          <strong className="text-gray-900">Islamic lunar year (ḥawl)</strong>. This calculator does
          not track ḥawl; confirm timing with a qualified scholar.
        </p>
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
          <p className="font-medium text-gray-800 mb-1">Reference metal prices (March 24, 2026)</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Gold: approximately {formatPkr(REFERENCE_GOLD_PRICE_PER_GRAM_PKR_MAR_2026)} per gram
            </li>
            <li>
              Silver: approximately {formatPkr(REFERENCE_SILVER_PRICE_PER_GRAM_PKR_MAR_2026)} per
              gram
            </li>
          </ul>
          <p className="mt-2 italic">
            Enter current gold and silver rates per gram below; nisab is calculated from them.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your details (PKR)</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Metal prices (for nisab threshold)
              </h3>
              <p className="text-xs text-gray-600">
                Approximate reference (March 24, 2026): gold{" "}
                {formatPkr(REFERENCE_GOLD_PRICE_PER_GRAM_PKR_MAR_2026)}/g, silver{" "}
                {formatPkr(REFERENCE_SILVER_PRICE_PER_GRAM_PKR_MAR_2026)}/g — adjust to your market
                rates.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gold (PKR per gram)
                  </label>
                  <input
                    {...bindBlur(goldPriceField, "gold_price_per_gram")}
                    type="number"
                    step="any"
                    min="0"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Silver (PKR per gram)
                  </label>
                  <input
                    {...bindBlur(silverPriceField, "silver_price_per_gram")}
                    type="number"
                    step="any"
                    min="0"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              {computedNisab != null && (
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Nisab threshold:</span>{" "}
                  <span className="font-semibold text-primary-700">
                    {formatPkr(computedNisab)}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    min(gold rate × {NISAB_GOLD_GRAMS}g, silver rate × {NISAB_SILVER_GRAMS}g)
                  </span>
                </p>
              )}
              {computedNisab == null && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                  Enter both gold and silver per-gram prices (greater than zero) to compute nisab.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cash</label>
              <input
                {...bindBlur(cashField, "cash")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gold value</label>
              <input
                {...bindBlur(goldValueField, "gold_value")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Silver value</label>
              <input
                {...bindBlur(silverValueField, "silver_value")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Investments</label>
              <input
                {...bindBlur(investmentsField, "investments")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business inventory</label>
              <input
                {...bindBlur(businessInventoryField, "business_inventory")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Receivables</label>
              <input
                {...bindBlur(receivablesField, "receivables")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short-term debts</label>
              <input
                {...bindBlur(shortTermDebtsField, "short_term_debts")}
                type="number"
                step="any"
                min="0"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
            >
              Calculate Zakat
            </button>
          </form>
        </div>

        <div id="zakat-result" className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total assets</span>
                  <span className="font-semibold">{formatPkr(result.total_assets)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Net wealth</span>
                  <span className="font-semibold">{formatPkr(result.net_wealth)}</span>
                </div>
                {computedNisab != null && (
                  <div className="flex justify-between text-sm">
                    <span>Nisab (from metal prices)</span>
                    <span className="font-semibold">{formatPkr(computedNisab)}</span>
                  </div>
                )}
                {result.status === "Zakat obligatory" && (
                  <div className="flex justify-between text-sm">
                    <span>Wealth above nisab</span>
                    <span className="font-semibold">
                      {formatPkr(result.zakatable_above_nisab)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-semibold">{result.status}</span>
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Zakat due (2.5% × wealth above nisab)
                  </p>
                  <p className="text-3xl font-bold text-primary-700">
                    {formatPkr(result.zakat_due)}
                  </p>
                </div>
              </div>

              {result.status === "Not obligatory" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                  Net wealth is below the nisab threshold — Zakat is not obligatory on this
                  estimate.
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-1">Note</p>
                <p>
                  This tool is for estimation only. It does not replace rulings on ḥawl (lunar year),
                  zakatable asset types, or nisab methodology. Confirm with a qualified scholar or
                  local authority.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CharityCalculator;
