import mongoose from "mongoose";

const healthLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    source: { type: String, enum: ["scan", "manual", "service", "system"], default: "scan" },
    mileage: Number,
    components: Object,
    score: Number,
    notes: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("HealthLog", healthLogSchema);
