import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchJournals, postJournalEntry } from "../accounts.api";
import JournalDraftForm from "../components/JournalDraftForm";
import { useAuth } from "@/hooks/useAuth";
import { Journal } from "@/types/journal";

const PAGE_SIZE = 50;

const JournalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ================== STATE ==================
  const [allJournals, setAllJournals] = useState<Journal[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Journal>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const [showDraft, setShowDraft] = useState(false);
  const [toast, setToast] = useState<string | null>(null);


  // ================== DATA LOAD ==================
  const reload = async () => {
    try {
      const data = await fetchJournals();
      setAllJournals(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load journal entries");
    }
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, []);

  // ================== POST JOURNAL ==================
  const handlePost = async (id: string) => {
  const confirm = window.confirm(
    "This will permanently post this journal entry. Continue?"
  );

  if (!confirm) return;

  try {
    await postJournalEntry(id);
    await reload();

    // ✅ SUCCESS TOAST
    setToast("Journal entry posted successfully");

    // auto-hide after 3 seconds
    setTimeout(() => setToast(null), 3000);
  } catch (e: any) {
    alert(
      e?.response?.data?.detail ||
        "Failed to post journal entry"
    );
  }
};

  // ================== SEARCH & SORT ==================
  const filtered = useMemo(() => {
    let data = [...allJournals];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (j) =>
          j.journal_number.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return data;
  }, [allJournals, search, sortKey, sortAsc]);

  // ================== PAGINATION ==================
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  // ================== RENDER ==================
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Accounts / Journal
      </h1>

      {toast && (
  <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 border border-green-300">
    {toast}
  </div>
)}

      {/* Search */}
      <input
        placeholder="Search journal number or description..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded"
      />

      {/* Create Draft */}
      <button
        onClick={() => setShowDraft((v) => !v)}
        className="mb-4 px-4 py-2 border rounded bg-white"
      >
        {showDraft ? "Cancel" : "Create Journal Draft"}
      </button>

      {showDraft && (
        <JournalDraftForm
          onSuccess={() => {
            setShowDraft(false);
            reload();
          }}
        />
      )}

      {loading && <p>Loading journal entries...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {/* Table */}
          <div className="border rounded overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="min-w-[1000px] border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border px-4 py-2">Journal #</th>
                  <th className="border px-4 py-2">Entry Date</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Created At</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.length > 0 ? (
                  pageItems.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td
                        className="border px-4 py-2 text-blue-600 cursor-pointer"
                        onClick={() =>
                          navigate(`/accounts/journal/${j.id}`)
                        }
                      >
                        {j.journal_number}
                      </td>
                      <td className="border px-4 py-2">
                        {j.entry_date}
                      </td>
                      <td className="border px-4 py-2">
                        {j.description}
                      </td>
                      <td className="border px-4 py-2">
                        {j.is_posted ? "POSTED" : "DRAFT"}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(j.created_at).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">
                        {!j.is_posted && user?.is_admin && (
                          <button
                            onClick={() => handlePost(j.id)}
                            className="px-3 py-1 rounded bg-green-600 text-white"
                          >
                            Post
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="border px-4 py-6 text-center text-gray-500"
                    >
                      No journal entries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                setPage((p) => (p < totalPages ? p + 1 : p))
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

export default JournalPage;