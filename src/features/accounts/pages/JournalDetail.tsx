import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchJournalDetail } from "../accounts.api";

interface JournalLine {
  account_code: string;
  debit: number;
  credit: number;
}

interface JournalDetail {
  id: string;
  journal_number: string;
  entry_date: string;
  description: string;
  is_posted: boolean;
  lines: JournalLine[];
}

const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [journal, setJournal] = useState<JournalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadJournal = async () => {
      try {
        const res = await fetchJournalDetail(id);
setJournal(res.data);
      } catch {
        setError("Failed to load journal entry");
      } finally {
        setLoading(false);
      }
    };

    loadJournal();
  }, [id]);

  if (loading) return <p>Loading journal entry...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!journal) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Journal {journal.journal_number}
      </h1>

      <p className="mb-2">
        <strong>Date:</strong> {journal.entry_date}
      </p>

      <p className="mb-4">
        <strong>Description:</strong> {journal.description}
      </p>

      <p className="mb-4">
        <strong>Status:</strong>{" "}
        {journal.is_posted ? "Posted" : "Draft"}
      </p>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Account</th>
              <th className="border px-4 py-2 text-right">Debit</th>
              <th className="border px-4 py-2 text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {journal.lines.map((line, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">
                  {line.account_code}
                </td>
                <td className="border px-4 py-2 text-right">
                  {line.debit > 0 ? line.debit.toFixed(2) : "-"}
                </td>
                <td className="border px-4 py-2 text-right">
                  {line.credit > 0 ? line.credit.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JournalDetail;