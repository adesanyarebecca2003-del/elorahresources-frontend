export interface Product {
  id: string;
  sku: string;
  name: string;
  category_code: string;
  category_name: string;
  color?: string;
  length?: number;
  grams?: number;
  size?: string;
  is_active: boolean;
  created_at: string;
}