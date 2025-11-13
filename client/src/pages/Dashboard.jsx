import { useEffect, useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import BudgetManager from "../components/BudgetManager";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { logout } = useContext(AuthContext);

  const fetchExpenses = async () => {
    const res = await API.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    fetchExpenses();
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteExpense = () => {
    fetchExpenses();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gray-100 p-6">

      {/* 🔥 LOGOUT BUTTON AT TOP */}
      <div className="w-full max-w-4xl flex justify-end mb-6">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition shadow"
        >
          Logout
        </button>
      </div>

      {/* CENTERED TITLE */}
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          My Budget Dashboard
        </h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-3xl space-y-10">

        {/* BUDGET MANAGER */}
        <BudgetManager refreshKey={refreshKey} />

        {/* EXPENSE SECTION */}
        <div className="bg-white p-6 rounded-xl shadow">

          {/* ⭐ ADD EXPENSE HEADER */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
            Add Expense
          </h2>

          <ExpenseForm onAdd={handleAddExpense} />

          {/* SPACING BEFORE EXPENSE LIST */}
          <div className="mt-8">
            <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          </div>

        </div>
      </div>
    </div>
  );
}


