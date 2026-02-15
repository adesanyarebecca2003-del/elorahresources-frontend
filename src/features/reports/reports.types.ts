// src/features/reports/reports.types.ts

export interface TrialBalanceRow {
  account_code: string;
  account_name: string;
  debit: string | number;   // backend returns Decimal -> often arrives as string
  credit: string | number;
}

export interface TrialBalanceResponse {
  as_at: string; // YYYY-MM-DD
  rows: TrialBalanceRow[];
  total_debit: string | number;
  total_credit: string | number;
  is_balanced: boolean;
}