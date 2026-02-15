import { useMemo, useState } from "react";
import { bulkUploadSales } from "@/features/sales/sales.api";

export default function SalesBulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const fileName = useMemo(() => file?.name || "No file selected", [file]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult(null);

    const picked = e.target.files?.[0] || null;

    if (!picked) {
      setFile(null);
      return;
    }

    const lower = picked.name.toLowerCase();
    const ok = lower.endsWith(".csv") || lower.endsWith(".xlsx");

    if (!ok) {
      setFile(null);
      setError("Only .csv or .xlsx files are allowed");
      return;
    }

    setFile(picked);
  };

  const handleUpload = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("Please choose a file first");
      return;
    }

    setLoading(true);

    try {
      const res = await bulkUploadSales(file);
      setResult(res);
      alert("Bulk sales uploaded successfully");
      setFile(null);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "Bulk upload failed. Please check file headers and data."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplateCsv = () => {
    // Header must match backend BulkSaleRow keys
    const headers =
      "sale_date,customer,product_sku,quantity,unit_price,amount_received\n";

    // Example row (ISO date is safest)
    const example =
      "2026-02-12,Ona Ara God's Own Ltd,INV-ATT-LUSH-WOW BRAID-1,1,5000,5000\n";

    const blob = new Blob([headers + example], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_sales_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Sales / Bulk Upload</h1>

      <div className="border rounded p-4 bg-white max-w-3xl">
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-700">
            Upload a <b>.csv</b> or <b>.xlsx</b> file. Each row = one sale transaction.
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={onPickFile}
              className="border px-3 py-2 rounded w-full"
            />

            <button
              onClick={downloadTemplateCsv}
              className="px-4 py-2 border rounded hover:opacity-80"
              type="button"
            >
              Download CSV Template
            </button>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
              type="button"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <div className="text-xs text-gray-600">
            Selected: <span className="font-medium">{fileName}</span>
          </div>

          <div className="mt-3 text-sm">
            <div className="font-semibold mb-2">Required headers</div>
            <div className="border rounded p-3 bg-gray-50 text-xs overflow-x-auto">
              sale_date, customer, product_sku, quantity, unit_price, amount_received
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Tip: ISO date (<b>YYYY-MM-DD</b>) is safest. Your backend also accepts
              <b> dd/mm/yyyy</b> and <b>mm/dd/yyyy</b>.
            </div>
          </div>

          {error && <p className="mt-3 text-red-600">{error}</p>}

          {result && (
            <div className="mt-4 border rounded p-3 bg-gray-50">
              <div className="font-semibold mb-2">Upload Result</div>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}