import mongoose from "mongoose";

const lineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    kind: { type: String, enum: ["labour", "parts", "misc"], default: "labour" },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    authorised: { type: Boolean, default: false },
  },
  { _id: true }
);

const workOrderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    garage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["queued", "in_progress", "awaiting_auth", "ready", "completed", "invoiced"],
      default: "queued",
    },
    complaint: String,
    findings: String,
    lines: [lineSchema],
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

workOrderSchema.virtual("total").get(function () {
  return (this.lines || []).reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
});

workOrderSchema.set("toJSON", { virtuals: true });
workOrderSchema.set("toObject", { virtuals: true });

export default mongoose.model("WorkOrder", workOrderSchema);
