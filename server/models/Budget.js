import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, required: true },
  limit: { type: Number, required: true }, // how much they plan to spend
});

export default mongoose.model("Budget", budgetSchema);
