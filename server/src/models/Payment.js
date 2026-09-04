import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "gbp" },
    method: { type: String, enum: ["card", "stripe", "demo", "bank"], default: "card" },
    status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" },
    stripeSessionId: String,
    last4: String,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
