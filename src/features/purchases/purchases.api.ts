import api from "@/services/axios";

export interface PurchaseLineCreate {
  product_id: string;   // UUID string
  quantity: number;     // should be integer
  unit_cost: number;    // decimal-ish
}

export interface PurchaseCreate {
  purchase_date: string; // "YYYY-MM-DD"
  supplier: string;
  amount_paid: number;
  lines: PurchaseLineCreate[];
}

export const createPurchase = async (payload: PurchaseCreate) => {
  const res = await api.post("/inventory/purchases/", payload);
  return res.data;
};

export const bulkUploadPurchases = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/inventory/bulk-upload/purchases", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};