import { useLocation, useNavigate } from "react-router-dom";
import { Category } from "@/types/category";

const CategoryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const category = location.state as Category | null;

  if (!category) {
    return (
      <div>
        <button
          onClick={() => navigate("/inventory/categories")}
          className="mb-4 px-4 py-2 border rounded"
        >
          ← Back to Categories
        </button>

        <p className="text-red-600">
          Category data not available. Please return to the list.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/inventory/categories")}
        className="mb-4 px-4 py-2 border rounded"
      >
        ← Back to Categories
      </button>

      <div className="border rounded p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">
          Category Details
        </h1>

        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {category.id}
          </p>
          <p>
            <strong>Code:</strong> {category.code}
          </p>
          <p>
            <strong>Name:</strong> {category.name}
          </p>
          <p>
            <strong>Active:</strong>{" "}
            {category.is_active ? "Yes" : "No"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {category.created_at}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;