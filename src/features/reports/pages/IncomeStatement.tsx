import { useState } from "react";
import {
  fetchIncomeStatement,
  exportIncomeStatement,
  IncomeStatementResponse,
} from "@/features/reports/reports.api";

export default function IncomeStatement() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<IncomeStatementResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setError("");

    if (!fromDate || !toDate) {
      setError("Please select From Date and To Date");
      return;
    }

    if (fromDate > toDate) {
      setError("From Date cannot be after To Date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchIncomeStatement(fromDate, toDate);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch income statement");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setError("");

    if (!fromDate || !toDate) {
      setError("Please select From Date and To Date before exporting");
      return;
    }

    setExporting(true);
    try {
      await exportIncomeStatement(fromDate, toDate, format);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to export income statement");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reports / Income Statement</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-3xl">
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
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Export CSV
        </button>

        <button
          onClick={() => handleExport("excel")}
          disabled={exporting}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>

      {/* Results */}
      {!data && (
        <p className="text-gray-500">
          Select a date range and click Generate to view the income statement.
        </p>
      )}

      {data && (
        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.name} className="border rounded">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
                <h2 className="font-semibold">{section.name}</h2>
                <span className="font-semibold">Total: {Number(section.total).toFixed(2)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[800px] border-collapse w-full">
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
                          {Number(r.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border px-4 py-2 font-semibold" colSpan={2}>
                        TOTAL
                      </td>
                      <td className="border px-4 py-2 text-right font-semibold">
                        {Number(section.total).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="border rounded p-4 bg-gray-50 flex items-center justify-between">
            <span className="font-semibold">Net Profit</span>
            <span className="font-semibold">{Number(data.net_profit).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}