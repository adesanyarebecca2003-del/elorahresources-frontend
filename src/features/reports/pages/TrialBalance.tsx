import { useState } from "react";
import { fetchTrialBalance, getTrialBalanceExportUrl } from "../reports.api";
import type { TrialBalanceResponse } from "../reports.types";

const toNumber = (v: string | number) => Number(v ?? 0);

const fmt = (v: string | number) =>
  toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TrialBalance() {
  const [asAt, setAsAt] = useState("");
  const [data, setData] = useState<TrialBalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setError("");
    setData(null);

    if (!asAt) {
      setError("Please select an 'As at' date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchTrialBalance(asAt);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load trial balance");
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: "csv" | "excel") => {
    if (!asAt) {
      setError("Pick an 'As at' date before exporting.");
      return;
    }
    // Uses your axios interceptor token because it’s a direct link request
    // BUT: links won’t include Authorization header automatically.
    // So we do a real fetch + blob download below.
    downloadExport(format);
  };

  const downloadExport = async (format: "csv" | "excel") => {
    setError("");
    setLoading(true);
    try {
      const url = getTrialBalanceExportUrl(asAt, format);

      const token = localStorage.getItem("access_token");
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Export failed");
      }

      const blob = await res.blob();
      const ext = format === "excel" ? "xlsx" : "csv";
      const filename = `trial_balance_${asAt}.${ext}`;

      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError(e?.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Reports / Trial Balance</h1>

        {data && (
          <span
            className={`px-3 py-1 text-sm rounded ${
              data.is_balanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {data.is_balanced ? "Balanced" : "Not Balanced"}
          </span>
        )}
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-4xl">
        <input
          type="date"
          value={asAt}
          onChange={(e) => setAsAt(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>

        <button
          onClick={() => exportFile("csv")}
          disabled={loading}
          className="px-4 py-2 rounded border border-[#C9A24D] text-[#C9A24D] disabled:opacity-50"
        >
          Export CSV
        </button>

        <button
          onClick={() => exportFile("excel")}
          disabled={loading}
          className="px-4 py-2 rounded border border-[#C9A24D] text-[#C9A24D] disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>

      {/* Table */}
      {data && (
        <div className="border rounded overflow-x-auto bg-white">
          <table className="min-w-[900px] border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Account Code</th>
                <th className="border px-4 py-2 text-left">Account Name</th>
                <th className="border px-4 py-2 text-right">Debit</th>
                <th className="border px-4 py-2 text-right">Credit</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((r) => (
                <tr key={r.account_code}>
                  <td className="border px-4 py-2">{r.account_code}</td>
                  <td className="border px-4 py-2">{r.account_name}</td>
                  <td className="border px-4 py-2 text-right">{fmt(r.debit)}</td>
                  <td className="border px-4 py-2 text-right">{fmt(r.credit)}</td>
                </tr>
              ))}

              <tr className="bg-gray-50 font-semibold">
                <td className="border px-4 py-2" colSpan={2}>
                  Totals
                </td>
                <td className="border px-4 py-2 text-right">{fmt(data.total_debit)}</td>
                <td className="border px-4 py-2 text-right">{fmt(data.total_credit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}