import express from "express";
import jwt from "jsonwebtoken";
import Expense from "../models/Expense.js";

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(403).json({ error: "Invalid token" });
  }
}

// ➤ Create expense
router.post("/", auth, async (req, res) => {
  const expense = new Expense({ ...req.body, userId: req.userId });
  await expense.save();
  res.json(expense);
});

// ➤ Get all expenses
router.get("/", auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId });
  res.json(expenses);
});

// ➤ Delete expense  ✅  <-- make sure this exists
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
