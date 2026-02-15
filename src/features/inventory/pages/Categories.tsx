import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAccounts } from "@/features/accounts/accounts.api";
import { Account } from "@/types/account";

import { fetchCategories, createCategory } from "../inventory.api";
import { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 50;

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ===== List state =====
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Create form state =====
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [inventoryAccountId, setInventoryAccountId] = useState<string | null>(null);
  const [cogsAccountId, setCogsAccountId] = useState<string | null>(null);
  const [revenueAccountId, setRevenueAccountId] = useState<string | null>(null);
  const [gainAccountId, setGainAccountId] = useState<string | null>(null);
  const [lossAccountId, setLossAccountId] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ===== Pagination =====
  const totalPages = Math.ceil(allCategories.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const categories = allCategories.slice(startIndex, endIndex);

  // ===== Load categories =====
useEffect(() => {
  const loadCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchCategories();
      setAllCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  loadCategories();
}, []);

// ===== Load accounts =====
useEffect(() => {
  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    }
  };

  loadAccounts();
}, []);

  // ===== Create category =====
  const handleCreate = async () => {
    setCreateError("");
    setCreating(true);

    try {
      await createCategory({
        code,
        name,
        inventory_account_id: inventoryAccountId,
        cogs_account_id: cogsAccountId,
        revenue_account_id: revenueAccountId,
        gain_account_id: gainAccountId,
        loss_account_id: lossAccountId,
        is_active: isActive,
      });

      // reset form
      setCode("");
      setName("");
      setIsActive(true);
      setInventoryAccountId(null);
      setCogsAccountId(null);
      setRevenueAccountId(null);
      setGainAccountId(null);
      setLossAccountId(null);
      setShowCreate(false);

      // refresh list
      const data = await fetchCategories();
      setAllCategories(Array.isArray(data) ? data : []);
    } catch {
      setCreateError("Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          Inventory / Categories
        </h1>

        {user?.is_admin && (
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
          >
            {showCreate ? "Cancel" : "Create Category"}
          </button>
        )}
      </div>

      {/* ===== Create Form ===== */}
      {showCreate && (
        <div className="border rounded p-4 mb-6 max-w-xl">
          <h2 className="font-semibold mb-3">New Category</h2>

          {createError && (
            <p className="text-red-600 mb-2">{createError}</p>
          )}

          <div className="space-y-3">
            <input
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <select
  value={inventoryAccountId ?? ""}
  onChange={(e) =>
    setInventoryAccountId(e.target.value || null)
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Select Inventory Account</option>
  {accounts.map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.code} – {acc.name}
    </option>
  ))}
</select>

            <select
  value={cogsAccountId ?? ""}
  onChange={(e) =>
    setCogsAccountId(e.target.value || null)
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Select COGS Account</option>
  {accounts.map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.code} – {acc.name}
    </option>
  ))}
</select>

            <select
  value={revenueAccountId ?? ""}
  onChange={(e) =>
    setRevenueAccountId(e.target.value || null)
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Select Revenue Account</option>
  {accounts.map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.code} – {acc.name}
    </option>
  ))}
</select>

            <select
  value={gainAccountId ?? ""}
  onChange={(e) =>
    setGainAccountId(e.target.value || null)
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Select Gain Account</option>
  {accounts.map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.code} – {acc.name}
    </option>
  ))}
</select>

            <select
  value={lossAccountId ?? ""}
  onChange={(e) =>
    setLossAccountId(e.target.value || null)
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Select Loss Account</option>
  {accounts.map((acc) => (
    <option key={acc.id} value={acc.id}>
      {acc.code} – {acc.name}
    </option>
  ))}
</select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
            >
              {creating ? "Creating..." : "Save Category"}
            </button>
          </div>
        </div>
      )}

      {/* ===== Loading / Error ===== */}
      {loading && <p>Loading categories...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* ===== Table ===== */}
      {!loading && !error && (
        <>
          <div className="border rounded overflow-y-auto max-h-[500px]">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Code</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      onClick={() =>
                        navigate(`/inventory/categories/${cat.id}`, {
                          state: cat,
                        })
                      }
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="border px-4 py-2">{cat.id}</td>
                      <td className="border px-4 py-2">{cat.code}</td>
                      <td className="border px-4 py-2">{cat.name}</td>
                      <td className="border px-4 py-2">
                        {cat.is_active ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border px-4 py-6 text-center text-gray-500"
                    >
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===== Pagination ===== */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) =>
                  p < totalPages ? p + 1 : p
                )
              }
              disabled={page >= totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;