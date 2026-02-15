// src/features/sales/sales.types.ts

export interface SaleLineCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface SaleCreate {
  sale_date: string;
  customer: string;
  amount_received: number; // ✅ REQUIRED for split logic
  lines: SaleLineCreate[];
}