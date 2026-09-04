import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "fleet_manager", "garage", "driver"],
      default: "driver",
    },
    phone: String,
    licenceNumber: String,
    garageId: { type: mongoose.Schema.Types.ObjectId, ref: "Garage" },
    avatarColor: { type: String, default: "#C4783A" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hash(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafe = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
