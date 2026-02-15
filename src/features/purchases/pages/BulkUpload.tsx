import { useState } from "react";
import api from "@/services/axios";

export default function PurchaseBulkUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const downloadTemplate = () => {
    // Must match backend BulkPurchaseRow schema keys EXACTLY
    const headers = [
      "purchase_date",
      "supplier",
      "product_sku",
      "quantity",
      "unit_cost",
      "amount_paid",
    ];

    const sampleRows = [
      ["2026-02-12", "Supplier A", "SKU-001", "2", "1200", "5000"],
      ["2026-02-12", "Supplier A", "SKU-002", "1", "2600", "5000"],
      ["2026-02-12", "Supplier B", "SKU-003", "5", "1100", "0"],
    ];

    const csv = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_purchases_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const upload = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("Please choose a CSV or XLSX file first.");
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      setError("Unsupported file format. Please upload .csv or .xlsx");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/inventory/bulk-upload/purchases", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          "Bulk upload failed. Check permissions, file headers, and period status."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Purchases / Bulk Upload</h1>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={downloadTemplate} className="px-4 py-2 border rounded">
          Download CSV Template
        </button>

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="border rounded px-3 py-2"
        />

        <button
          onClick={upload}
          disabled={uploading || !file}
          className="px-6 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && (
        <div className="text-sm text-gray-600 mb-3">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-700 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-green-300 bg-green-50 text-green-800 rounded p-3">
          <div className="font-semibold">Upload result</div>
          <pre className="text-xs mt-2 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-gray-600 mt-6">
        <div className="font-medium mb-1">Required headers:</div>
        <ul className="list-disc ml-5 space-y-1">
          <li><code>purchase_date</code> (YYYY-MM-DD)</li>
          <li><code>supplier</code></li>
          <li><code>product_sku</code></li>
          <li><code>quantity</code> (&gt; 0)</li>
          <li><code>unit_cost</code> (&gt; 0)</li>
          <li><code>amount_paid</code> (optional; defaults to 0)</li>
        </ul>
      </div>
    </div>
  );
}