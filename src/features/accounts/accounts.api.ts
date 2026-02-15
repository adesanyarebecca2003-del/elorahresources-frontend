import api from "@/services/axios";
import { Account } from "@/types/account";

export const fetchAccounts = async (): Promise<Account[]> => {
  const response = await api.get("/accounts");
  return response.data;
};

export const createJournalDraft = (payload: {
  entry_date: string;
  description: string;
  lines: {
    account_code: string;
    debit: number;
    credit: number;
  }[];
}) => {
  return api.post("/journals/draft", payload);
};

export const createAccount = async (payload: {
  code: string;
  name: string;
  account_type: string;
  normal_balance: string;
  parent_id?: string | null;
  is_posting: boolean;
  is_active: boolean;
  is_current: boolean;
}) => {
  const response = await api.post("/accounts", payload);
  return response.data;
};

export const fetchAccountingPeriods = async () => {
  const response = await api.get("/accounting-periods");
  return response.data;
};

export const closeAccountingPeriod = async (payload: {
  start_date: string;
  end_date: string;
}) => {
  const response = await api.post("/accounting-periods/close", payload);
  return response.data;
};

export const fetchJournals = async () => {
  const res = await api.get("/journals");
  return res.data;
};

export const fetchJournalDetail = (id: string) =>
  api.get(`/journals/${id}`);

export const postJournalEntry = (id: string) => {
  return api.post(`/journals/${id}/post`);
};