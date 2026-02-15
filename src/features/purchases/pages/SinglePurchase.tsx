import { useEffect, useState } from "react";
import { fetchProducts } from "@/features/inventory/inventory.api";
import { createPurchase } from "@/features/purchases/purchases.api";
import { Product } from "@/types/product";

interface Line {
  product_id: string;
  quantity: number;
  unit_cost: number;
}

const SinglePurchase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { product_id: "", quantity: 1, unit_cost: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load products for dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  const updateLine = (
    index: number,
    field: keyof Line,
    value: any
  ) => {
    const copy = [...lines];
    copy[index] = { ...copy[index], [field]: value };
    setLines(copy);
  };

  const addLine = () => {
    setLines([
      ...lines,
      { product_id: "", quantity: 1, unit_cost: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const totalAmount = lines.reduce(
    (sum, l) => sum + l.quantity * l.unit_cost,
    0
  );

  const handleSubmit = async () => {
    setError("");

    if (!purchaseDate || !supplier) {
      setError("Purchase date and supplier are required");
      return;
    }

    if (amountPaid > totalAmount) {
  setError("Amount paid cannot exceed total purchase amount");
  return;
}

if (lines.some(l => l.quantity <= 0 || l.unit_cost < 0)) {
  setError("Quantity must be at least 1 and unit cost must be 0 or more");
  return;
}

    if (lines.some((l) => !l.product_id)) {
      setError("All lines must have a product selected");
      return;
    }

    setLoading(true);

    try {
      await createPurchase({
        purchase_date: purchaseDate,
        supplier,
        amount_paid: amountPaid,
        lines,
      });

      alert("Purchase created successfully");

      // reset
      setPurchaseDate("");
      setSupplier("");
      setLines([{ product_id: "", quantity: 1, unit_cost: 0 }]);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Failed to create purchase"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Purchases / Single Purchase
      </h1>

      {error && (
        <p className="mb-4 text-red-600">{error}</p>
      )}

      {/* Header */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-xl">
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
  type="number"
  placeholder="Amount Paid"
  value={amountPaid}
  onChange={(e) => setAmountPaid(Number(e.target.value))}
  className="border px-3 py-2 rounded"
/>

        <input
          placeholder="Supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Lines */}
      <div className="border rounded overflow-x-auto">
        <table className="min-w-[800px] border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">Qty</th>
              <th className="border px-4 py-2">Unit Cost</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="border px-4 py-2">
                  <select
                    value={line.product_id}
                    onChange={(e) =>
                      updateLine(
                        i,
                        "product_id",
                        e.target.value
                      )
                    }
                    className="w-full border px-2 py-1 rounded"
                  >
                    <option value="">
                      Select product
                    </option>
                    {products.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.sku} – {p.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border px-4 py-2">
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(
                        i,
                        "quantity",
                        Math.max(1, Math.floor(Number(e.target.value)))
                      )
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>

                <td className="border px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={line.unit_cost}
                    onChange={(e) =>
                      updateLine(
                        i,
                        "unit_cost",
                        Number(e.target.value)
                      )
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>

                <td className="border px-4 py-2">
                  {(line.quantity * line.unit_cost).toFixed(
                    2
                  )}
                </td>

                <td className="border px-4 py-2">
                  {lines.length > 1 && (
                    <button
                      onClick={() => removeLine(i)}
                      className="text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={addLine}
          className="px-4 py-2 border rounded"
        >
          + Add Line
        </button>

        <div className="font-semibold">
          Total: {totalAmount.toFixed(2)}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Purchase"}
        </button>
      </div>
    </div>
  );
};

export default SinglePurchase;