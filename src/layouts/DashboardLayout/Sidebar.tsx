import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const isActive = (path: string, currentPath: string) =>
  currentPath === path;

const MenuSection = ({
  title,
  basePath,
  children,
}: {
  title: string;
  basePath?: string;
  children?: React.ReactNode;
}) => {
  const location = useLocation();
  const shouldOpen = basePath
    ? location.pathname.startsWith(basePath)
    : false;

  const [open, setOpen] = useState(shouldOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left py-2 font-medium hover:opacity-80 ${
          shouldOpen ? "text-[#C9A24D]" : ""
        }`}
      >
        {title}
      </button>
      {open && <div className="ml-4 text-sm space-y-1">{children}</div>}
    </div>
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const itemClass = (path: string) =>
    `cursor-pointer px-2 py-1 rounded ${
      isActive(path, location.pathname)
        ? "bg-[#C9A24D] text-white"
        : "hover:underline"
    }`;

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-64 bg-[#9FD3B8] text-white px-4 py-6 flex flex-col overflow-hidden">
      <div className="font-bold text-lg mb-6">EL&apos;ORAH ERP</div>

      <nav className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-[#C9A24D] scrollbar-track-transparent">
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full text-left py-2 font-medium ${
            isActive("/dashboard", location.pathname)
              ? "text-[#C9A24D]"
              : "hover:opacity-80"
          }`}
        >
          Dashboard
        </button>

       <MenuSection title="Inventory" basePath="/inventory">
  <div
    className={itemClass("/inventory/categories")}
    onClick={() => navigate("/inventory/categories")}
  >
    Categories
  </div>

  <div
    className={itemClass("/inventory/products")}
    onClick={() => navigate("/inventory/products")}
  >
    Products
  </div>

  <div
    className={itemClass("/inventory/adjustments")}
    onClick={() => navigate("/inventory/adjustments")}
  >
    Adjustments
  </div>
</MenuSection>

        <MenuSection title="Accounts" basePath="/accounts">
  <div
    className={itemClass("/accounts/chart-of-accounts")}
    onClick={() => navigate("/accounts/chart-of-accounts")}
  >
    Chart of Accounts
  </div>

  <div
    className={itemClass("/accounts/journal")}
    onClick={() => navigate("/accounts/journal")}
  >
    Journal
  </div>

  <div
    className={itemClass("/accounts/period-close")}
    onClick={() => navigate("/accounts/period-close")}
  >
    Period Close
  </div>
</MenuSection>

        <MenuSection title="Purchases" basePath="/purchases">
          <div
            className={itemClass("/purchases/single")}
            onClick={() => navigate("/purchases/single")}
          >
            Single Purchase
          </div>
          <div
            className={itemClass("/purchases/bulk")}
            onClick={() => navigate("/purchases/bulk")}
          >
            Bulk Upload
          </div>
        </MenuSection>

        <MenuSection title="Sales" basePath="/sales">
          <div
            className={itemClass("/sales/single")}
            onClick={() => navigate("/sales/single")}
          >
            Single Sale
          </div>
          <div className={itemClass("/sales/returns")} onClick={() => navigate("/sales/returns")}>
    Sales Returns
  </div>
          <div
            className={itemClass("/sales/bulk")}
            onClick={() => navigate("/sales/bulk")}
          >
            Bulk Upload
          </div>
        </MenuSection>

        <MenuSection title="Reports" basePath="/reports">
  <div
    className={itemClass("/reports/trial-balance")}
    onClick={() => navigate("/reports/trial-balance")}
  >
    Trial Balance
  </div>

  <div
    className={itemClass("/reports/ledger")}
    onClick={() => navigate("/reports/ledger")}
  >
    Ledger
  </div>

  <div
    className={itemClass("/reports/inventory-valuation")}
    onClick={() => navigate("/reports/inventory-valuation")}
  >
    Inventory Valuation
  </div>

  <div
    className={itemClass("/reports/income-statement")}
    onClick={() => navigate("/reports/income-statement")}
  >
    Income Statement
  </div>

  <div
    className={itemClass("/reports/financial-position")}
    onClick={() => navigate("/reports/financial-position")}
  >
    Statement of Financial Position
  </div>
</MenuSection>

        <button
          onClick={() => navigate("/authorization")}
          className={`w-full text-left py-2 font-medium ${
            isActive("/authorization", location.pathname)
              ? "text-[#C9A24D]"
              : "hover:opacity-80"
          }`}
        >
          Authorization
        </button>
      </nav>

      <div className="mt-auto text-xs">
        © elorahresourcesenterprise 2026
      </div>
    </aside>
  );
};