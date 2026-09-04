import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    garage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceType: {
      type: String,
      enum: ["service", "mot", "repair", "tyres", "diagnostics", "bodywork", "recall"],
      default: "service",
    },
    scheduledAt: Date,
    status: {
      type: String,
      enum: ["requested", "confirmed", "checked_in", "cancelled", "converted"],
      default: "requested",
    },
    symptoms: String,
    dropOffNotes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
