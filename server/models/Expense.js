import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  amount: Number,
  category: String, // ✅ this must exist
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Expense", expenseSchema);
