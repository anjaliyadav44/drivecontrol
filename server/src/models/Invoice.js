import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder" },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    garage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
    billedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        description: String,
        qty: Number,
        unitPrice: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    currency: { type: String, default: "gbp" },
    status: { type: String, enum: ["draft", "issued", "paid", "void"], default: "issued" },
    dueDate: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
