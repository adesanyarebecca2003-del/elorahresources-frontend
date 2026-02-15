import { useEffect, useState } from "react";
import {
  fetchAccountingPeriods,
  closeAccountingPeriod,
} from "../accounts.api";
import { useAuth } from "@/hooks/useAuth";

const PeriodClose = () => {
  const { user } = useAuth();

  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");
  const [closeResult, setCloseResult] = useState<string | null>(null);

  const loadPeriods = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAccountingPeriods();
      setPeriods(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load accounting periods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleClosePeriod = async () => {
    setCloseError("");
    setCloseResult(null);

    if (!startDate || !endDate) {
      setCloseError("Start date and end date are required");
      return;
    }

    setClosing(true);
    try {
      const res = await closeAccountingPeriod({
        start_date: startDate,
        end_date: endDate,
      });

      setCloseResult(
        `Period closed successfully. Net result: ${res.net_result}`
      );

      setStartDate("");
      setEndDate("");
      await loadPeriods();
    } catch (err: any) {
      setCloseError(
        err?.response?.data?.detail || "Failed to close period"
      );
    } finally {
      setClosing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Accounts / Period Close
      </h1>

      <h1 className="text-xl font-semibold">Period Close</h1>;

      {/* ===== Close Period Form (Admin Only) ===== */}
      {user?.is_admin && (
        <div className="border rounded p-4 mb-6 max-w-xl">
          <h2 className="font-semibold mb-3">Close Accounting Period</h2>

          {closeError && (
            <p className="text-red-600 mb-2">{closeError}</p>
          )}

          {closeResult && (
            <p className="text-green-700 mb-2">{closeResult}</p>
          )}

          <div className="flex gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>

          <button
            onClick={handleClosePeriod}
            disabled={closing}
            className="mt-4 px-4 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
          >
            {closing ? "Closing..." : "Close Period"}
          </button>
        </div>
      )}

      {/* ===== Period List ===== */}
      {loading && <p>Loading periods...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="border rounded overflow-x-auto overflow-y-auto max-h-[400px]">
          <table className="min-w-[900px] border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2">Period</th>
                <th className="border px-4 py-2">Start</th>
                <th className="border px-4 py-2">End</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Closed By</th>
                <th className="border px-4 py-2">Closed At</th>
              </tr>
            </thead>

            <tbody>
              {periods.length > 0 ? (
                periods.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.start_date}</td>
                    <td className="border px-4 py-2">{p.end_date}</td>
                    <td className="border px-4 py-2">
                      {p.is_closed ? "CLOSED" : "OPEN"}
                    </td>
                    <td className="border px-4 py-2">
                      {p.closed_by || "-"}
                    </td>
                    <td className="border px-4 py-2">
                      {p.closed_at
                        ? new Date(p.closed_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border px-4 py-6 text-center text-gray-500"
                  >
                    No accounting periods yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PeriodClose;
