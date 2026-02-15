import { useEffect, useMemo, useState } from "react";
import api from "@/services/axios";
import {
  createInventoryAdjustment,
  InventoryAdjustmentType,
} from "@/features/inventory/inventory.api";

type ProductOption = {
  id: string;
  sku: string;
  name: string;
};

type LineState = {
  product_id: string;
  quantity: string;   // keep as string for input control
  unit_cost: string;  // keep as string for input control
};

const fmtErr = (e: any) => e?.response?.data?.detail || e?.message || "Request failed";

export default function Adjustments() {
  const [adjustmentDate, setAdjustmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<InventoryAdjustmentType>("INCREASE");

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [lines, setLines] = useState<LineState[]>([
    { product_id: "", quantity: "1", unit_cost: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ load products for dropdown
  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      setError("");
      try {
        // 👇 Change this path if your products endpoint differs
        const res = await api.get("/inventory/products/", { params: { limit: 500 } });
        // expected shape: either {items: []} or []
        const list = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.results ?? [];
        const mapped: ProductOption[] = list.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
        }));
        setProducts(mapped);
      } catch (e: any) {
        setError(`Failed to load products: ${fmtErr(e)}`);
      } finally {
        setLoadingProducts(false);
      }
    };

    load();
  }, []);

  const addLine = () => {
    setLines((prev) => [...prev, { product_id: "", quantity: "1", unit_cost: "" }]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, patch: Partial<LineState>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  // INCREASE requires unit_cost; DECREASE should hide/ignore unit_cost
  const showUnitCost = type === "INCREASE";

  // Basic frontend validation so backend doesn’t shout
  const validation = useMemo(() => {
    if (!adjustmentDate) return "Please select adjustment date.";
    if (!reason.trim()) return "Please enter a reason.";
    if (lines.length === 0) return "Add at least one line.";
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l.product_id) return `Line ${i + 1}: select a product.`;
      const q = Number(l.quantity);
      if (!Number.isFinite(q) || q <= 0 || !Number.isInteger(q)) {
        return `Line ${i + 1}: quantity must be a whole number greater than 0.`;
      }
      if (type === "INCREASE") {
        const uc = Number(l.unit_cost);
        if (!Number.isFinite(uc) || uc <= 0) return `Line ${i + 1}: unit cost required for INCREASE.`;
      }
    }
    return "";
  }, [adjustmentDate, reason, lines, type]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        adjustment_date: adjustmentDate,
        reason: reason.trim(),
        adjustment_type: type,
        lines: lines.map((l) => ({
          product_id: l.product_id,
          quantity: Number(l.quantity),
          unit_cost: type === "INCREASE" ? l.unit_cost : null,
        })),
      };

      await createInventoryAdjustment(payload as any);

      setSuccess("Adjustment created successfully. Check your Journal Drafts for the posting entry.");
      // reset
      setLines([{ product_id: "", quantity: "1", unit_cost: "" }]);
      setReason("");
    } catch (e: any) {
      setError(fmtErr(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Inventory / Adjustments</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      {/* Header */}
      <div className="border rounded p-4 mb-6 space-y-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Adjustment Date</label>
            <input
              type="date"
              value={adjustmentDate}
              onChange={(e) => setAdjustmentDate(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => {
                const next = e.target.value as InventoryAdjustmentType;
                setType(next);
                // if switching to DECREASE, clear unit_costs so we don't send garbage
                if (next === "DECREASE") {
                  setLines((prev) => prev.map((l) => ({ ...l, unit_cost: "" })));
                }
              }}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="INCREASE">Increase (Stock Gain)</option>
              <option value="DECREASE">Decrease (Stock Loss)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Stock count, damaged goods, found extra..."
              className="border px-3 py-2 rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className="border rounded overflow-hidden max-w-6xl">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
          <div className="font-semibold">Adjustment Lines</div>
          <button onClick={addLine} className="px-3 py-2 border rounded">
            + Add Line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-left">Product</th>
                <th className="border px-4 py-2 text-right">Quantity</th>
                {showUnitCost && (
                  <th className="border px-4 py-2 text-right">Unit Cost</th>
                )}
                <th className="border px-4 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">
                    <select
                      value={l.product_id}
                      onChange={(e) => updateLine(idx, { product_id: e.target.value })}
                      className="border px-3 py-2 rounded w-full"
                      disabled={loadingProducts}
                    >
                      <option value="">
                        {loadingProducts ? "Loading products..." : "Select product"}
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border px-4 py-2 text-right">
                    <input
                      value={l.quantity}
                      onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                      className="border px-3 py-2 rounded w-32 text-right"
                      inputMode="numeric"
                    />
                  </td>

                  {showUnitCost && (
                    <td className="border px-4 py-2 text-right">
                      <input
                        value={l.unit_cost}
                        onChange={(e) => updateLine(idx, { unit_cost: e.target.value })}
                        className="border px-3 py-2 rounded w-40 text-right"
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                    </td>
                  )}

                  <td className="border px-4 py-2">
                    <button
                      onClick={() => removeLine(idx)}
                      className="px-3 py-2 border rounded"
                      disabled={lines.length === 1}
                      title={lines.length === 1 ? "At least one line required" : "Remove"}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {lines.length === 0 && (
                <tr>
                  <td className="border px-4 py-3 text-gray-600" colSpan={showUnitCost ? 4 : 3}>
                    No lines yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <div className="px-4 py-4 flex items-center justify-end gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Create Adjustment"}
          </button>
        </div>
      </div>

      {/* UX hint */}
      <p className="text-sm text-gray-600 mt-4">
        Note: For <b>DECREASE</b>, costing is derived from FIFO layers. For <b>INCREASE</b>, you must supply unit cost.
      </p>
    </div>
  );
}