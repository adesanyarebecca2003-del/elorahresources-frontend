// src/features/reports/reports.api.ts
import api from "@/services/axios";
import type { TrialBalanceResponse } from "./reports.types";

export const fetchTrialBalance = async (asAt: string) => {
  const res = await api.get<TrialBalanceResponse>("/trial-balance/", {
    params: { as_at: asAt },
  });
  return res.data;
};

export const getTrialBalanceExportUrl = (asAt: string, format: "csv" | "excel") => {
  const base = import.meta.env.VITE_API_URL;
  return `${base}/trial-balance/export?as_at=${encodeURIComponent(asAt)}&format=${format}`;
};

export type IncomeStatementRow = {
  section: string;
  account_code: string;
  account_name: string;
  amount: string; // backend sends Decimal -> usually string
};

export type IncomeStatementSection = {
  name: string;
  total: string;
  rows: IncomeStatementRow[];
};

export type IncomeStatementResponse = {
  from_date: string;
  to_date: string;
  sections: IncomeStatementSection[];
  net_profit: string;
};

export const fetchIncomeStatement = async (from_date: string, to_date: string) => {
  const res = await api.get<IncomeStatementResponse>("/income-statement/", {
    params: { from_date, to_date },
  });
  return res.data;
};

// Export (downloads file)
export const exportIncomeStatement = async (
  from_date: string,
  to_date: string,
  format: "csv" | "excel"
) => {
  const res = await api.get("/income-statement/export", {
    params: { from_date, to_date, format },
    responseType: "blob",
  });

  const ext = format === "excel" ? "xlsx" : "csv";
  const filename = `income_statement_${from_date}_to_${to_date}.${ext}`;

  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export type BalanceSheetRow = {
  section: string; // Assets / Liabilities / Equity
  account_code: string;
  account_name: string;
  amount: string;
};

export type BalanceSheetSection = {
  name: string;
  total: string;
  rows: BalanceSheetRow[];
};

export type BalanceSheetResponse = {
  as_at: string;
  sections: BalanceSheetSection[];
  total_assets: string;
  total_liabilities: string;
  total_equity: string;
  is_balanced: boolean;
};

/** ✅ Backend types (match your FastAPI schema exactly) */
type BackendBalanceSheetRow = {
  section: string;
  subsection: string;
  account_code: string;
  account_name: string;
  balance: string; // Decimal usually comes as string
};

type BackendBalanceSheetSection = {
  name: string;
  total: string;
  rows: BackendBalanceSheetRow[];
};

type BackendBalanceSheetResponse = {
  as_at: string;
  assets: BackendBalanceSheetSection;
  liabilities: BackendBalanceSheetSection;
  equity: BackendBalanceSheetSection;
  total_assets: string;
  total_liabilities: string;
  total_equity: string;
  balances: boolean; // backend uses "balances"
};

/** ✅ Transformer: backend -> frontend */
const mapSection = (
  label: "Assets" | "Liabilities" | "Equity",
  sec: BackendBalanceSheetSection
): BalanceSheetSection => ({
  name: sec?.name ?? label,
  total: sec?.total ?? "0",
  rows: (sec?.rows ?? []).map((r) => ({
    section: label,
    account_code: r.account_code,
    account_name: r.account_name,
    amount: String(r.balance ?? "0"),
  })),
});

const mapBalanceSheet = (b: BackendBalanceSheetResponse): BalanceSheetResponse => ({
  as_at: b.as_at,
  sections: [
    mapSection("Assets", b.assets),
    mapSection("Liabilities", b.liabilities),
    mapSection("Equity", b.equity),
  ],
  total_assets: b.total_assets,
  total_liabilities: b.total_liabilities,
  total_equity: b.total_equity,
  is_balanced: b.balances,
});

/** ✅ Now fetch uses backend type but RETURNS frontend type */
export const fetchBalanceSheet = async (as_at: string) => {
  const res = await api.get<BackendBalanceSheetResponse>("/balance-sheet/", {
    params: { as_at },
  });
  return mapBalanceSheet(res.data);
};

export const exportBalanceSheet = async (
  as_at: string,
  format: "csv" | "excel"
) => {
  const res = await api.get("/balance-sheet/export", {
    params: { as_at, format },
    responseType: "blob",
  });

  const ext = format === "excel" ? "xlsx" : "csv";
  const filename = `balance_sheet_as_at_${as_at}.${ext}`;

  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export type LedgerLine = {
  journal_number: string;
  entry_date: string; // date -> string in JSON
  description?: string | null;
  debit: string;      // Decimal -> string
  credit: string;     // Decimal -> string
  balance: string;    // Decimal -> string
};

export type AccountLedger = {
  account_code: string;
  account_name: string;
  opening_balance: string;
  total_debit: string;
  total_credit: string;
  closing_balance: string;
  lines: LedgerLine[];
};

export type LedgerResponse = {
  from_date?: string | null;
  to_date?: string | null;
  accounts: AccountLedger[];
};

export const fetchLedger = async (from_date?: string, to_date?: string) => {
  const res = await api.get<LedgerResponse>("/ledger/", {
    params: {
      ...(from_date ? { from_date } : {}),
      ...(to_date ? { to_date } : {}),
    },
  });
  return res.data;
};

export const fetchAccountLedger = async (
  account_code: string,
  from_date?: string,
  to_date?: string
) => {
  const res = await api.get<AccountLedger>(`/ledger/${account_code}`, {
    params: {
      ...(from_date ? { from_date } : {}),
      ...(to_date ? { to_date } : {}),
    },
  });
  return res.data;
};

export const exportLedger = async (
  format: "csv" | "excel",
  from_date?: string,
  to_date?: string
) => {
  const res = await api.get("/ledger/export", {
    params: {
      format,
      ...(from_date ? { from_date } : {}),
      ...(to_date ? { to_date } : {}),
    },
    responseType: "blob",
  });

  const ext = format === "excel" ? "xlsx" : "csv";
  const filename = `ledger_${from_date ?? "all"}_${to_date ?? "all"}.${ext}`;

  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export type InventoryValuationProduct = {
  sku: string;
  name: string;
  quantity: string;       // Decimal -> string
  value: string;          // Decimal -> string
  unit_cost_avg: string;  // Decimal -> string
};

export type InventoryValuationCategory = {
  category_code: string;
  category_name: string;
  quantity: string;
  value: string;
  products: InventoryValuationProduct[];
};

export type InventoryValuationResponse = {
  as_at: string; // date -> string
  categories: InventoryValuationCategory[];
  total_inventory_value: string;
};

export const fetchInventoryValuation = async (as_at: string) => {
  const res = await api.get<InventoryValuationResponse>("/inventory-valuation/", {
    params: { as_at },
  });
  return res.data;
};

export const exportInventoryValuation = async (
  as_at: string,
  format: "csv" | "excel"
) => {
  const res = await api.get("/inventory-valuation/export", {
    params: { as_at, format },
    responseType: "blob",
  });

  const ext = format === "excel" ? "xlsx" : "csv";
  const filename = `inventory_valuation_as_at_${as_at}.${ext}`;

  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};