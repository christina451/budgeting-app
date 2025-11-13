import express from "express";
import jwt from "jsonwebtoken";
import Budget from "../models/Budget.js";
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

/* ----------------------------------------------------------
   CREATE or UPDATE a budget
---------------------------------------------------------- */
router.post("/", auth, async (req, res) => {
  const { category, limit } = req.body;

  if (!category || !limit)
    return res.status(400).json({ error: "Category and limit required" });

  const catLower = category.trim().toLowerCase();

  // check existing
  const existing = await Budget.findOne({
    userId: req.userId,
    category: catLower,
  });

  if (existing) {
    existing.limit = limit;
    await existing.save();
    return res.json({ message: "Budget updated", budget: existing });
  }

  const budget = new Budget({
    userId: req.userId,
    category: catLower,
    limit,
  });

  await budget.save();
  res.json({ message: "Budget created", budget });
});

/* ----------------------------------------------------------
   GET all budgets
---------------------------------------------------------- */
router.get("/", auth, async (req, res) => {
  const budgets = await Budget.find({ userId: req.userId });
  res.json(budgets);
});

/* ----------------------------------------------------------
   DELETE a budget
   (IMPORTANT: this must be BEFORE the /:category GET route)
---------------------------------------------------------- */
router.delete("/:category", auth, async (req, res) => {
  const category = req.params.category.trim().toLowerCase();

  const deleted = await Budget.findOneAndDelete({
    userId: req.userId,
    category,
  });

  if (!deleted) {
    return res.status(404).json({ error: "Budget not found" });
  }

  return res.json({ message: "Budget deleted" });
});

/* ----------------------------------------------------------
   GET budget status for category
---------------------------------------------------------- */
router.get("/:category", auth, async (req, res) => {
  const categoryParam = req.params.category.trim().toLowerCase();

  const budget = await Budget.findOne({
    userId: req.userId,
    category: categoryParam,
  });

  if (!budget) {
    return res.status(404).json({ error: "No budget set" });
  }

  const expenses = await Expense.find({
    userId: req.userId,
    category: { $regex: new RegExp(`^${categoryParam}$`, "i") },
  });

  const spent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remaining = budget.limit - spent;

  res.json({
    category: budget.category,
    limit: budget.limit,
    spent,
    remaining,
  });
});

export default router;
