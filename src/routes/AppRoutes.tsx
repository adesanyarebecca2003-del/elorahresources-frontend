import { Routes, Route, Navigate } from "react-router-dom";
import CategoryDetail from "@/features/inventory/pages/CategoryDetail";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ProtectedRoute from "./ProtectedRoute";

import Categories from "@/features/inventory/pages/Categories";
import Adjustments from "@/features/inventory/pages/Adjustments";
import Products from "@/features/inventory/pages/Products";

import ChartOfAccounts from "@/features/accounts/pages/ChartOfAccounts";
import JournalDetail from "@/features/accounts/pages/JournalDetail";
import PeriodClose from "@/features/accounts/pages/PeriodClose";
import JournalPage from "@/features/accounts/pages/Journal";

import SinglePurchase from "@/features/purchases/pages/SinglePurchase";
import PurchaseBulkUpload from "@/features/purchases/pages/BulkUpload";

import SingleSale from "@/features/sales/pages/SingleSale";
import SalesReturns from "@/features/sales/pages/SalesReturns";
import SalesBulkUpload from "@/features/sales/pages/BulkUpload";

import TrialBalance from "@/features/reports/pages/TrialBalance";
import Ledger from "@/features/reports/pages/Ledger";
import LedgerAccount from "@/features/reports/pages/LedgerAccount";
import InventoryValuation from "@/features/reports/pages/InventoryValuation";
import IncomeStatement from "@/features/reports/pages/IncomeStatement";
import FinancialPosition from "@/features/reports/pages/FinancialPosition";

import DashboardShell from "@/layouts/DashboardShell";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={<Login />} />

      <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

 <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/inventory/categories" element={<Categories />} />
      <Route path="/inventory/Adjustments" element={<Adjustments />} />
      <Route
  path="/inventory/categories/:id"
  element={
    <ProtectedRoute>
      <CategoryDetail />
    </ProtectedRoute>
  }
/>

      <Route path="/inventory/products" element={<Products />} />

      <Route path="/accounts/chart-of-accounts" element={<ChartOfAccounts />} />
      <Route path="/accounts/journal" element={<JournalPage />} />
      <Route path="accounts/journal/:id" element={<JournalDetail />} />
      <Route path="/accounts/period-close" element={<PeriodClose />} />

      <Route path="/purchases/single" element={<SinglePurchase />} />
      <Route path="/purchases/bulk" element={<PurchaseBulkUpload />} />

      <Route path="/sales/single" element={<SingleSale />} />
      <Route path="/sales/returns" element={<SalesReturns />} />
      <Route path="/sales/bulk" element={<SalesBulkUpload />} />

      <Route path="/reports/trial-balance" element={<TrialBalance />} />
      <Route path="/reports/ledger" element={<Ledger />} />
      <Route path="/reports/ledger/:accountCode" element={<LedgerAccount />} />
      <Route path="/reports/inventory-valuation" element={<InventoryValuation />} />
      <Route path="/reports/income-statement" element={<IncomeStatement />} />
      <Route path="/reports/financial-position"
        element={<FinancialPosition />}
      />
    </Routes>
  );
};