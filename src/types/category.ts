export interface Category {
  id: number;
  code: string;
  name: string;
  inventory_account_id: number | null;
  cogs_account_id: number | null;
  revenue_account_id: number | null;
  gain_account_id: number | null;
  loss_account_id: number | null;
  is_active: boolean;
  created_at: string;
}