import API from "../api/api";

export default function ExpenseList({ expenses = [], onDelete = () => {} }) {
  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      onDelete();
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense.");
    }
  };

  return (
    <div className="mt-10 text-center">
      <h2 className="text-xl font-semibold mb-3">Expenses</h2>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses yet.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="bg-gray-50 border p-3 rounded flex justify-between items-center"
            >
              <span>
                {expense.title}: ${Number(expense.amount || 0).toFixed(2)}{" "}
                <span className="text-gray-500">({expense.category})</span>
              </span>

              <button
                onClick={() => handleDelete(expense._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
