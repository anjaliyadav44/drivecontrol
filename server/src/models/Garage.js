import mongoose from "mongoose";

const garageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    town: String,
    postcode: String,
    phone: String,
    email: String,
    specialties: [String],
    rating: { type: Number, default: 4.6 },
    openHours: { type: String, default: "Mon–Sat 08:00–18:00" },
    capacity: { type: Number, default: 8 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Garage", garageSchema);
