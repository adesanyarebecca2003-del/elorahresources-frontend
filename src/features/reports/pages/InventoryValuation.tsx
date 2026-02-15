import { useMemo, useState } from "react";
import {
  fetchInventoryValuation,
  exportInventoryValuation,
  InventoryValuationResponse,
} from "@/features/reports/reports.api";

const fmt = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

export default function InventoryValuation() {
  const [asAt, setAsAt] = useState("");
  const [data, setData] = useState<InventoryValuationResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );
  const [search, setSearch] = useState("");

  const handleFetch = async () => {
    setError("");

    if (!asAt) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchInventoryValuation(asAt);

      // Defensive: avoid blank screen if backend shape changes
      if (!res || !Array.isArray((res as any).categories)) {
        console.log("Inventory valuation response (unexpected):", res);
        setData(null);
        setError("Unexpected response format. Check console for details.");
        return;
      }

      setData(res);
      // reset category open state
      setOpenCategories({});
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to fetch inventory valuation");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setError("");

    if (!asAt) {
      setError("Please select a date before exporting");
      return;
    }

    setExporting(true);
    try {
      await exportInventoryValuation(asAt, format);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to export inventory valuation");
    } finally {
      setExporting(false);
    }
  };

  const toggleCategory = (code: string) => {
    setOpenCategories((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const expandAll = () => {
    if (!data) return;
    const next: Record<string, boolean> = {};
    for (const c of data.categories) next[c.category_code] = true;
    setOpenCategories(next);
  };

  const collapseAll = () => setOpenCategories({});

  const filteredCategories = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.categories;

    return data.categories
      .map((cat) => {
        const products = (cat.products ?? []).filter((p) => {
          return (
            p.sku.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q)
          );
        });
        // keep category if name/code matches, or if any products match
        const catMatch =
          cat.category_code.toLowerCase().includes(q) ||
          cat.category_name.toLowerCase().includes(q);

        if (catMatch) return cat; // keep full category
        if (products.length === 0) return null;
        return { ...cat, products };
      })
      .filter(Boolean) as any[];
  }, [data, search]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Reports / Inventory Valuation
      </h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 max-w-5xl">
        <input
          type="date"
          value={asAt}
          onChange={(e) => setAsAt(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={handleFetch}
          disabled={loading}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SKU, product, category..."
          className="border px-3 py-2 rounded"
        />

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

      {data && (
        <div className="border rounded p-4 bg-gray-50 mb-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="font-semibold">
              As at: <span className="font-normal">{data.as_at}</span>
            </div>
            <div className="text-lg font-semibold">
              Total Inventory Value: {fmt(data.total_inventory_value)}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 border rounded" onClick={expandAll}>
              Expand all
            </button>
            <button className="px-3 py-2 border rounded" onClick={collapseAll}>
              Collapse all
            </button>
          </div>
        </div>
      )}

      {!data && (
        <p className="text-gray-500">
          Select a date and click Generate to view inventory valuation.
        </p>
      )}

      {data && (
        <div className="space-y-4">
          {filteredCategories.map((cat: any) => {
            const isOpen = !!openCategories[cat.category_code];
            return (
              <div key={cat.category_code} className="border rounded overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat.category_code)}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:opacity-90 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">
                      {cat.category_code} — {cat.category_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Qty: {fmt(cat.quantity)} • Value: {fmt(cat.value)}
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    {isOpen ? "Hide ▲" : "Show ▼"}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-4 py-2 text-left">SKU</th>
                            <th className="border px-4 py-2 text-left">Product</th>
                            <th className="border px-4 py-2 text-right">Qty</th>
                            <th className="border px-4 py-2 text-right">Avg Unit Cost</th>
                            <th className="border px-4 py-2 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(cat.products ?? []).map((p: any) => (
                            <tr key={p.sku}>
                              <td className="border px-4 py-2">{p.sku}</td>
                              <td className="border px-4 py-2">{p.name}</td>
                              <td className="border px-4 py-2 text-right">{fmt(p.quantity)}</td>
                              <td className="border px-4 py-2 text-right">{fmt(p.unit_cost_avg)}</td>
                              <td className="border px-4 py-2 text-right">{fmt(p.value)}</td>
                            </tr>
                          ))}

                          {(cat.products ?? []).length === 0 && (
                            <tr>
                              <td colSpan={5} className="border px-4 py-3 text-gray-600">
                                No products found in this category.
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
          })}

          {filteredCategories.length === 0 && (
            <div className="border rounded p-4 text-gray-600">
              No matching categories/products.
            </div>
          )}
        </div>
      )}
    </div>
  );
}