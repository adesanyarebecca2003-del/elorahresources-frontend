import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLedger, exportLedger, LedgerResponse } from "@/features/reports/reports.api";

const fmt = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export default function Ledger() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<LedgerResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetchLedger(fromDate || undefined, toDate || undefined);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch ledger");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setError("");
    setExporting(true);
    try {
      await exportLedger(format, fromDate || undefined, toDate || undefined);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to export ledger");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reports / Ledger</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 max-w-4xl">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            {exporting ? "..." : "CSV"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            {exporting ? "..." : "Excel"}
          </button>
        </div>
      </div>

      {!data && (
        <p className="text-gray-500">
          Pick a date range (optional) and click Generate to view the ledger.
        </p>
      )}

      {data && (
        <div className="border rounded overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 font-semibold">
            Accounts ({data.accounts.length})
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2 text-left">Code</th>
                  <th className="border px-4 py-2 text-left">Account</th>
                  <th className="border px-4 py-2 text-right">Opening</th>
                  <th className="border px-4 py-2 text-right">Debit</th>
                  <th className="border px-4 py-2 text-right">Credit</th>
                  <th className="border px-4 py-2 text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((a) => (
                  <tr
                    key={a.account_code}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/reports/ledger/${a.account_code}`, {
                        state: { fromDate, toDate },
                      })
                    }
                  >
                    <td className="border px-4 py-2">{a.account_code}</td>
                    <td className="border px-4 py-2">{a.account_name}</td>
                    <td className="border px-4 py-2 text-right">{fmt(a.opening_balance)}</td>
                    <td className="border px-4 py-2 text-right">{fmt(a.total_debit)}</td>
                    <td className="border px-4 py-2 text-right">{fmt(a.total_credit)}</td>
                    <td className="border px-4 py-2 text-right">{fmt(a.closing_balance)}</td>
                  </tr>
                ))}
                {data.accounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border px-4 py-3 text-gray-600">
                      No ledger data for the selected range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}