import { useState } from "react";
import {
  fetchBalanceSheet,
  exportBalanceSheet,
  BalanceSheetResponse,
} from "@/features/reports/reports.api";

const fmt = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const isValidBalanceSheet = (x: any): x is BalanceSheetResponse => {
  return (
    x &&
    typeof x === "object" &&
    typeof x.as_at === "string" &&
    Array.isArray(x.sections) &&
    typeof x.total_assets !== "undefined" &&
    typeof x.total_liabilities !== "undefined" &&
    typeof x.total_equity !== "undefined" &&
    typeof x.is_balanced === "boolean"
  );
};

export default function FinancialPosition() {
  const [asAt, setAsAt] = useState("");
  const [data, setData] = useState<BalanceSheetResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");

    if (!asAt) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchBalanceSheet(asAt);

      // Prevent white screen: validate shape before using it
      if (!isValidBalanceSheet(res)) {
        console.log("Balance sheet response (unexpected shape):", res);
        setData(null);
        setError(
          "Balance sheet response format is different from what the UI expects. Check console for the returned data."
        );
        return;
      }

      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch balance sheet");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setError("");

    if (!asAt) {
      setError("Please select a date before exporting");
      return;
    }

    setExporting(true);
    try {
      await exportBalanceSheet(asAt, format);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to export balance sheet");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Reports / Statement of Financial Position
      </h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-xl">
        <input
          type="date"
          value={asAt}
          onChange={(e) => setAsAt(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>

        <button
          onClick={() => handleExport("excel")}
          disabled={exporting}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>

      {!data && (
        <p className="text-gray-500">
          Select a date and click Generate to view the balance sheet.
        </p>
      )}

      {data && (
        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.name} className="border rounded overflow-hidden">
              <div className="flex justify-between px-4 py-3 bg-gray-100">
                <h2 className="font-semibold">{section.name}</h2>
                <span className="font-semibold">
                  Total: {fmt(section.total)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-left">Account Code</th>
                      <th className="border px-4 py-2 text-left">Account Name</th>
                      <th className="border px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r) => (
                      <tr key={`${section.name}-${r.account_code}`}>
                        <td className="border px-4 py-2">{r.account_code}</td>
                        <td className="border px-4 py-2">{r.account_name}</td>
                        <td className="border px-4 py-2 text-right">
                          {fmt(r.amount)}
                        </td>
                      </tr>
                    ))}

                    {section.rows.length === 0 && (
                      <tr>
                        <td className="border px-4 py-2 text-gray-600" colSpan={3}>
                          No rows in this section.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border rounded p-4 bg-gray-50 space-y-2 max-w-3xl">
            <div className="flex justify-between">
              <span>Total Assets</span>
              <span>{fmt(data.total_assets)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Liabilities</span>
              <span>{fmt(data.total_liabilities)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Equity</span>
              <span>{fmt(data.total_equity)}</span>
            </div>

            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Status</span>
              <span className={data.is_balanced ? "text-green-600" : "text-red-600"}>
                {data.is_balanced ? "Balanced ✔" : "Not Balanced ✖"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}