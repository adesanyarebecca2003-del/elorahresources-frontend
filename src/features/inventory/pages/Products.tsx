import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../inventory.api";
import { fetchCategories, createProduct } from "../inventory.api";
import { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";
import { Product } from "@/types/product";

const PAGE_SIZE = 50;

const Products = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Product>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const { user } = useAuth();

const [categories, setCategories] = useState<Category[]>([]);
const [showCreate, setShowCreate] = useState(false);
const [creating, setCreating] = useState(false);
const [createError, setCreateError] = useState("");

const [sku, setSku] = useState("");
const [name, setName] = useState("");
const [categoryCode, setCategoryCode] = useState("");
const [color, setColor] = useState("");
const [length, setLength] = useState("");
const [grams, setGrams] = useState("");
const [size, setSize] = useState("");
const [isActive, setIsActive] = useState(true);

  // ===== Load products =====
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProducts();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  loadCategories();
}, []);

// ===== Create category =====
const handleCreateProduct = async () => {
  setCreateError("");
  setCreating(true);

  if (!sku || !name || !categoryCode) {
  setCreateError("SKU, Name, and Category are required");
  setCreating(false);
  return;
}

  try {
    await createProduct({
  sku,
  name,
  category_code: categoryCode,
  color: color || undefined,
  length: length || undefined,
  grams: grams || undefined,
  size: size || undefined,
});

    // reset form
    setSku("");
    setName("");
    setCategoryCode("");
    setColor("");
    setLength("");
    setGrams("");
    setSize("");
    setIsActive(true);
    setShowCreate(false);

    // refresh list
    const data = await fetchProducts();
    setAllProducts(Array.isArray(data) ? data : []);
  } catch {
    setCreateError("Failed to create product");
  } finally {
    setCreating(false);
  }
};

  // ===== Search & sort =====
  const filteredProducts = useMemo(() => {
    let data = [...allProducts];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q)
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
  }, [allProducts, search, sortKey, sortAsc]);

  // ===== Pagination =====
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredProducts.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Inventory / Products
      </h1>

{user?.is_admin && (
  <div className="mb-4">
    <button
      onClick={() => setShowCreate((v) => !v)}
      className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
    >
      {showCreate ? "Cancel" : "Create Product"}
    </button>
  </div>
)}

{showCreate && (
  <div className="border rounded p-4 mb-6 max-w-2xl">
    <h2 className="font-semibold mb-3">New Product</h2>

    {createError && (
      <p className="text-red-600 mb-2">{createError}</p>
    )}

    <div className="grid grid-cols-2 gap-3">
      <input
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <select
  value={categoryCode}
  onChange={(e) => setCategoryCode(e.target.value)}
>
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.code}>
            {c.code} – {c.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <input
  placeholder="Length"
  value={length}
  onChange={(e) => setLength(e.target.value)}
  className="border px-3 py-2 rounded"
/>

      <input
  placeholder="Grams"
  value={grams}
  onChange={(e) => setGrams(e.target.value)}
  className="border px-3 py-2 rounded"
/>

      <input
        placeholder="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <label className="flex items-center gap-2 col-span-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>
    </div>

    <button
      onClick={handleCreateProduct}
      disabled={creating}
      className="mt-4 px-4 py-2 rounded bg-[#C9A24D] text-white disabled:opacity-50"
    >
      {creating ? "Creating..." : "Save Product"}
    </button>
  </div>
)}

      {/* Search */}
      <input
        placeholder="Search by name, SKU, category..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded"
      />

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {/* Table */}
          <div className="border rounded overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="min-w-[1200px] border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {[
                    ["sku", "SKU"],
                    ["name", "Name"],
                    ["category_name", "Category"],
                    ["color", "Color"],
                    ["length", "Length"],
                    ["grams", "Grams"],
                    ["size", "Size"],
                    ["is_active", "Active"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="border px-4 py-2 cursor-pointer"
                      onClick={() => {
                        if (sortKey === key) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortKey(key as keyof Product);
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
                {pageItems.length > 0 ? (
                  pageItems.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="border px-4 py-2">{p.sku}</td>
                      <td className="border px-4 py-2">{p.name}</td>
                      <td className="border px-4 py-2">
                        {p.category_code} – {p.category_name}
                      </td>
                      <td className="border px-4 py-2">{p.color ?? "-"}</td>
                      <td className="border px-4 py-2">{p.length ?? "-"}</td>
                      <td className="border px-4 py-2">{p.grams ?? "-"}</td>
                      <td className="border px-4 py-2">{p.size ?? "-"}</td>
                      <td className="border px-4 py-2">
                        {p.is_active ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="border px-4 py-6 text-center text-gray-500"
                    >
                      No products found
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

export default Products;