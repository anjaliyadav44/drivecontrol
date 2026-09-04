import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    registration: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vin: { type: String, trim: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: String,
    fuelType: { type: String, enum: ["petrol", "diesel", "hybrid", "electric"], default: "petrol" },
    mileage: { type: Number, default: 0 },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    preferredGarage: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
    components: {
      engine: { type: Number, default: 86 },
      transmission: { type: Number, default: 88 },
      brakes: { type: Number, default: 82 },
      tires: { type: Number, default: 79 },
      battery: { type: Number, default: 90 },
      cooling: { type: Number, default: 85 },
      electrics: { type: Number, default: 87 },
    },
    healthScore: { type: Number, default: 85 },
    healthStatus: { type: String, enum: ["healthy", "watch", "attention", "vor"], default: "healthy" },
    vor: { type: Boolean, default: false },
    motDue: Date,
    serviceDue: Date,
    insuranceDue: Date,
    taxDue: Date,
    lastServiceAt: Date,
    notes: String,
    documents: [
      {
        name: String,
        kind: { type: String, enum: ["mot", "insurance", "service", "invoice", "other"], default: "other" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
