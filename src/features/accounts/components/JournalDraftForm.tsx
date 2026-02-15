import { useEffect, useState } from "react";
import { fetchAccounts, createJournalDraft } from "../accounts.api";
import { Account } from "@/types/account";

interface Line {
  account_code: string;
  debit: number;
  credit: number;
}

const JournalDraftForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [entryDate, setEntryDate] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { account_code: "", debit: 0, credit: 0 },
    { account_code: "", debit: 0, credit: 0 },
  ]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      const data = await fetchAccounts();
      setAccounts(data);
    };
    loadAccounts();
  }, []);

  const updateLine = <K extends keyof Line>(
  index: number,
  field: K,
  value: Line[K]
) => {
  const copy = [...lines];
  copy[index] = {
    ...copy[index],
    [field]: value,
  };
  setLines(copy);
};

  const addLine = () => {
    setLines([...lines, { account_code: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    try {
      await createJournalDraft({
        entry_date: entryDate,
        description,
        lines,
      });

      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded p-4 mb-6">
      <h2 className="font-semibold mb-4">New Journal Draft</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <table className="min-w-full border mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Account</th>
            <th className="border px-2 py-1">Debit</th>
            <th className="border px-2 py-1">Credit</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">
                <select
                  value={line.account_code}
                  onChange={(e) =>
                    updateLine(idx, "account_code", e.target.value)
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.code}>
                      {a.code} – {a.name}
                    </option>
                  ))}
                </select>
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={line.debit}
                  onChange={(e) =>
                    updateLine(idx, "debit", Number(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </td>

              <td className="border px-2 py-1">
                <input
                  type="number"
                  value={line.credit}
                  onChange={(e) =>
                    updateLine(idx, "credit", Number(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </td>

              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => removeLine(idx)}
                  className="text-red-600"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addLine}
        className="px-3 py-1 border rounded mr-2"
      >
        + Add Line
      </button>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="px-4 py-2 rounded bg-[#C9A24D] text-white"
      >
        {saving ? "Saving..." : "Save Draft"}
      </button>
    </div>
  );
};

export default JournalDraftForm;