import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { fetchAccountLedger, AccountLedger } from "@/features/reports/reports.api";

const fmt = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export default function LedgerAccount() {
  const { accountCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [fromDate, setFromDate] = useState(location?.state?.fromDate ?? "");
  const [toDate, setToDate] = useState(location?.state?.toDate ?? "");
  const [data, setData] = useState<AccountLedger | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!accountCode) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetchAccountLedger(
        accountCode,
        fromDate || undefined,
        toDate || undefined
      );
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch account ledger");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountCode]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          className="border px-3 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold">
          Ledger / {accountCode}
        </h1>
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 max-w-3xl">
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
          onClick={load}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-gray-500">No data loaded yet.</p>
      )}

      {data && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="border rounded p-4 bg-gray-50 max-w-4xl">
            <div className="font-semibold mb-2">
              {data.account_code} — {data.account_name}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
              <div className="flex justify-between md:block">
                <span className="text-gray-600">Opening</span>
                <div className="font-medium">{fmt(data.opening_balance)}</div>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-gray-600">Debit</span>
                <div className="font-medium">{fmt(data.total_debit)}</div>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-gray-600">Credit</span>
                <div className="font-medium">{fmt(data.total_credit)}</div>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-gray-600">Closing</span>
                <div className="font-medium">{fmt(data.closing_balance)}</div>
              </div>
            </div>
          </div>

          {/* Lines */}
          <div className="border rounded overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 font-semibold">
              Entries ({data.lines.length})
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 text-left">Journal #</th>
                    <th className="border px-4 py-2 text-left">Date</th>
                    <th className="border px-4 py-2 text-left">Description</th>
                    <th className="border px-4 py-2 text-right">Debit</th>
                    <th className="border px-4 py-2 text-right">Credit</th>
                    <th className="border px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lines.map((l, idx) => (
                    <tr key={`${l.journal_number}-${idx}`}>
                      <td className="border px-4 py-2">{l.journal_number}</td>
                      <td className="border px-4 py-2">{String(l.entry_date)}</td>
                      <td className="border px-4 py-2">{l.description ?? ""}</td>
                      <td className="border px-4 py-2 text-right">{fmt(l.debit)}</td>
                      <td className="border px-4 py-2 text-right">{fmt(l.credit)}</td>
                      <td className="border px-4 py-2 text-right">{fmt(l.balance)}</td>
                    </tr>
                  ))}
                  {data.lines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="border px-4 py-3 text-gray-600">
                        No entries in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}