import { useEffect, useState } from "react";
import API from "../api/api";

export default function BudgetManager({ refreshKey }) {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [warnings, setWarnings] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await API.get("/budgets");
      const allBudgets = res.data;

      const withSpent = await Promise.all(
        allBudgets.map(async (b) => {
          const spentRes = await API.get(`/budgets/${b.category}`);
          return { ...b, spent: spentRes.data.spent || 0 };
        })
      );

      setBudgets(withSpent);
      generateWarnings(withSpent);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !limit) return;

    try {
      await API.post("/budgets", { category, limit: parseFloat(limit) });
      setCategory("");
      setLimit("");
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const generateWarnings = (list) => {
    const w = list
      .filter((b) => b.spent >= b.limit * 0.9)
      .map((b) =>
        b.spent >= b.limit
          ? `⚠️ ${b.category} is OVER budget by $${(b.spent - b.limit).toFixed(2)}`
          : `⚠️ ${b.category} is near its limit (${(
              (b.spent / b.limit) * 100
            ).toFixed(1)}%)`
      );
    setWarnings(w);
  };

  const handleDeleteBudget = (cat) => {
    setBudgetToDelete(cat);
    setShowDeleteModal(true);
  };

  const confirmDeleteBudget = async () => {
    try {
      await API.delete(`/budgets/${budgetToDelete}`);
      setShowDeleteModal(false);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit), 0);

  return (
    <>
      <div className="w-full bg-white p-6 rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Budget Categories</h2>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 mb-6 justify-center"
        >
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded-lg w-full sm:w-1/3 shadow-sm"
          />

          <input
            type="number"
            placeholder="Limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="border p-2 rounded-lg w-full sm:w-1/3 shadow-sm"
          />

          <button className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition shadow">
            Save
          </button>
        </form>

        {/* BUDGET CARDS */}
        <div className="space-y-4">
          {budgets.map((b) => {
            const percent = (b.spent / b.limit) * 100;

            return (
              <div
                key={b.category}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm"
              >
                <h3 className="text-lg font-semibold capitalize text-gray-800">
                  {b.category}
                </h3>

                <p className="text-gray-700">
                  ${b.spent.toFixed(2)} / ${b.limit.toFixed(2)} (
                  {percent.toFixed(1)}%)
                </p>

                <div className="bg-gray-200 h-3 rounded mt-2">
                  <div
                    className={`h-3 rounded transition-all ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 90
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => handleDeleteBudget(b.category)}
                  className="mt-3 bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition shadow"
                >
                  Delete Budget
                </button>
              </div>
            );
          })}
        </div>

        {/* TOTAL SPENDING */}
        {totalSpent > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Spending
            </h3>

            <div className="bg-gray-200 h-4 rounded mb-2 flex overflow-hidden rounded-xl">
              {budgets.map((b) => {
                const percent = (b.spent / totalSpent) * 100;
                return (
                  <div
                    key={b.category}
                    className="h-4"
                    style={{
                      width: `${percent}%`,
                      backgroundColor:
                        percent >= 50
                          ? "#ef4444"
                          : percent >= 30
                          ? "#f59e0b"
                          : "#3b82f6",
                    }}
                  ></div>
                );
              })}
            </div>

            {/* REMOVED BULLET POINTS */}
            <div className="text-sm text-gray-700 space-y-1">
              {budgets.map((b) => (
                <div key={b.category}>
                  {b.category}: ${b.spent.toFixed(2)} (
                  {((b.spent / b.limit) * 100).toFixed(1)}% of limit)
                </div>
              ))}
            </div>

            <p className="mt-2 font-medium text-gray-700">
              Total Spent: ${totalSpent.toFixed(2)} / ${totalLimit.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <dialog open className="rounded-lg p-6 shadow-xl animate-fadeIn text-center">

          <h2 className="text-xl font-bold mb-3">
            Delete Budget?
          </h2>

          <p className="mb-5">
            Delete the budget for <strong>{budgetToDelete}</strong>?
          </p>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={confirmDeleteBudget}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
            >
              Delete
            </button>
          </div>

        </dialog>
      )}
    </>
  );
}
