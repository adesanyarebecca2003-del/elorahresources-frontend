import { useEffect, useMemo, useState } from "react";
import { fetchAccounts, createAccount } from "../accounts.api";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 50;

const ChartOfAccounts = () => {
  const { user } = useAuth();

  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("code");
  const [sortAsc, setSortAsc] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
const [creating, setCreating] = useState(false);
const [createError, setCreateError] = useState("");

const [code, setCode] = useState("");
const [name, setName] = useState("");
const [accountType, setAccountType] = useState("ASSET");
const [normalBalance, setNormalBalance] = useState("DEBIT");
const [parentId, setParentId] = useState<string | null>(null);
const [isPosting, setIsPosting] = useState(true);
const [isActive, setIsActive] = useState(true);
const [isCurrent, setIsCurrent] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAccounts();
        setAllAccounts(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleCreateAccount = async () => {
  setCreateError("");
  setCreating(true);

  if (!code || !name) {
    setCreateError("Code and Name are required");
    setCreating(false);
    return;
  }

  try {
    await createAccount({
      code,
      name,
      account_type: accountType,
      normal_balance: normalBalance,
      parent_id: parentId,
      is_posting: isPosting,
      is_active: isActive,
      is_current: isCurrent,
    });

    // reset form
    setCode("");
    setName("");
    setAccountType("ASSET");
    setNormalBalance("DEBIT");
    setParentId(null);
    setIsPosting(true);
    setIsActive(true);
    setIsCurrent(true);
    setShowCreate(false);

    // refresh list
    const data = await fetchAccounts();
    setAllAccounts(Array.isArray(data) ? data : []);
  } catch {
    setCreateError("Failed to create account");
  } finally {
    setCreating(false);
  }
};

  const filteredAccounts = useMemo(() => {
    let data = [...allAccounts];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.account_type.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return data;
  }, [allAccounts, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filteredAccounts.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredAccounts.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Accounts / Chart of Accounts
      </h1>

      {user?.is_admin && (
  <div className="mb-4">
    <button
      onClick={() => setShowCreate((v) => !v)}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
    >
      {showCreate ? "Cancel" : "Create Account"}
    </button>
  </div>
)}

{showCreate && (
  <div className="border rounded p-4 mb-6 max-w-2xl">
    <h2 className="font-semibold mb-3">New Account</h2>

    {createError && (
      <p className="text-red-600 mb-2">{createError}</p>
    )}

    <div className="grid grid-cols-2 gap-3">
      <input
        placeholder="Account Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <input
        placeholder="Account Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <select
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        {["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={normalBalance}
        onChange={(e) => setNormalBalance(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        {["DEBIT", "CREDIT"].map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        value={parentId ?? ""}
        onChange={(e) =>
          setParentId(e.target.value || null)
        }
        className="border px-3 py-2 rounded col-span-2"
      >
        <option value="">No Parent Account</option>
        {allAccounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.code} – {a.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPosting}
          onChange={(e) => setIsPosting(e.target.checked)}
        />
        Posting Account
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
        />
        Current Account
      </label>
    </div>

    <button
      onClick={handleCreateAccount}
      disabled={creating}
      className="mt-4 px-4 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
    >
      {creating ? "Creating..." : "Save Account"}
    </button>
  </div>
)}

 <h1 className="text-xl font-semibold">Chart of Accounts</h1>;

      <input
        placeholder="Search by code, name, or type..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded"
      />

      {loading && <p>Loading accounts...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="border rounded overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="min-w-[1200px] border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {[
                    ["code", "Code"],
                    ["name", "Name"],
                    ["account_type", "Type"],
                    ["normal_balance", "Normal"],
                    ["is_posting", "Posting"],
                    ["is_active", "Active"],
                    ["is_system_locked", "Locked"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="border px-4 py-2 cursor-pointer"
                      onClick={() => {
                        if (sortKey === key) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortKey(key);
                          setSortAsc(true);
                        }
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {pageItems.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{a.code}</td>
                    <td className="border px-4 py-2">{a.name}</td>
                    <td className="border px-4 py-2">{a.account_type}</td>
                    <td className="border px-4 py-2">{a.normal_balance}</td>
                    <td className="border px-4 py-2">
                      {a.is_posting ? "Yes" : "No"}
                    </td>
                    <td className="border px-4 py-2">
                      {a.is_active ? "Yes" : "No"}
                    </td>
                    <td className="border px-4 py-2">
                      {a.is_system_locked ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) => (p < totalPages ? p + 1 : p))
                }
                disabled={page >= totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChartOfAccounts;




 
