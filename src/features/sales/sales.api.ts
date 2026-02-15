import api from "@/services/axios";
import { SaleCreate } from "./sales.types";

export const createSale = async (payload: SaleCreate) => {
  const res = await api.post("/inventory/sales/", payload);
  return res.data;
};

export const bulkUploadSales = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/inventory/bulk-upload/sales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export type SalesReturnLineCreate = {
  sale_line_id: string;
  quantity: number;
};

export type SalesReturnCreate = {
  return_date: string;
  customer: string;
  amount_refunded: number;
  lines: SalesReturnLineCreate[];
};

export const createSalesReturn = async (payload: SalesReturnCreate) => {
  const res = await api.post("/inventory/sales-returns/", payload);
  return res.data;
};