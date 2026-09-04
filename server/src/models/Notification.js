import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    body: String,
    kind: { type: String, enum: ["health", "booking", "invoice", "system"], default: "system" },
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
