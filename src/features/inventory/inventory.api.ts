import api from "@/services/axios";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get("/inventory/categories");
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await api.get("/inventory/products");
  return response.data;
};

export interface CreateCategoryPayload {
  code: string;
  name: string;
  inventory_account_id: string | null;
  cogs_account_id: string | null;
  revenue_account_id: string | null;
  gain_account_id: string | null;
  loss_account_id: string | null;
  is_active: boolean;
}

export const createCategory = async (
  payload: CreateCategoryPayload
) => {
  const response = await api.post("/inventory/categories", payload);
  return response.data;
};

export const createProduct = async (payload: {
  sku: string;
  name: string;
  category_code: string;
  color?: string;
  length?: string;
  grams?: string;
  size?: string;
}) => {
  const response = await api.post("/inventory/products", payload);
  return response.data;
};

export const createPurchase = async (payload: any) => {
  const res = await api.post("/inventory/purchases/", payload);
  return res.data;
}

export type InventoryAdjustmentType = "INCREASE" | "DECREASE";

export type InventoryAdjustmentLineCreate = {
  product_id: string;
  quantity: number;            // send integer
  unit_cost?: string | null;   // required for INCREASE
};

export type InventoryAdjustmentCreate = {
  adjustment_date: string; // YYYY-MM-DD
  reason: string;
  adjustment_type: InventoryAdjustmentType;
  lines: InventoryAdjustmentLineCreate[];
};

export const createInventoryAdjustment = async (payload: InventoryAdjustmentCreate) => {
  const res = await api.post("/inventory/adjustments/", payload);
  return res.data;
};