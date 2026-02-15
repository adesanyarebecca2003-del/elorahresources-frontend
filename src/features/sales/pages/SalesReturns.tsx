import { useState } from "react";
import { createSalesReturn } from "@/features/sales/sales.api";

type Line = {
  sale_line_id: string;
  quantity: number;
};

export default function SalesReturn() {
  const [returnDate, setReturnDate] = useState("");
  const [customer, setCustomer] = useState("");
  const [amountRefunded, setAmountRefunded] = useState<number>(0);
  const [lines, setLines] = useState<Line[]>([{ sale_line_id: "", quantity: 1 }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateLine = (index: number, field: keyof Line, value: any) => {
    const copy = [...lines];
    copy[index] = { ...copy[index], [field]: value };
    setLines(copy);
  };

  const addLine = () => setLines([...lines, { sale_line_id: "", quantity: 1 }]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError("");

    if (!returnDate || !customer) {
      setError("Return date and customer are required");
      return;
    }

    if (lines.some((l) => !l.sale_line_id)) {
      setError("All lines must have a sale_line_id");
      return;
    }

    if (lines.some((l) => l.quantity <= 0)) {
      setError("Quantity must be at least 1");
      return;
    }

    setLoading(true);

    try {
      await createSalesReturn({
        return_date: returnDate,
        customer,
        amount_refunded: amountRefunded,
        lines: lines.map((l) => ({
          sale_line_id: l.sale_line_id,
          quantity: Math.max(1, Math.floor(Number(l.quantity))),
        })),
      });

      alert("Sales return created successfully");

      setReturnDate("");
      setCustomer("");
      setLines([{ sale_line_id: "", quantity: 1 }]);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create sales return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Sales / Sales Return</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-3xl">
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          placeholder="Customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      <input
  type="number"
  min={0}
  placeholder="Amount Refunded"
  value={amountRefunded}
  onChange={(e) => setAmountRefunded(Number(e.target.value))}
  className="border px-3 py-2 rounded"
/>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-[800px] border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Sale Line ID</th>
              <th className="border px-4 py-2">Qty Returned</th>
              <th className="border px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="border px-4 py-2">
                  <input
                    placeholder="Paste sale_line_id (UUID)"
                    value={line.sale_line_id}
                    onChange={(e) => updateLine(i, "sale_line_id", e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>

                <td className="border px-4 py-2">
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(i, "quantity", Math.max(1, Math.floor(Number(e.target.value))))
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>

                <td className="border px-4 py-2">
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="text-red-600">
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={addLine} className="px-4 py-2 border rounded">
          + Add Line
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Return"}
        </button>
      </div>
      

      <p className="text-xs text-gray-500 mt-4">
        Note: For now, you paste the Sale Line ID manually. Next step is we’ll add a “pick from sales”
        dropdown/table so you don’t hunt UUIDs.
      </p>
    </div>
  );
}