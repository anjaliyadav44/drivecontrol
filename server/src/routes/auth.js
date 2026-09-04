import { Router } from "express";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });
    const allowed = ["fleet_manager", "garage", "driver"];
    const chosen = allowed.includes(role) ? role : "driver";
    const user = await User.create({ name, email, password, role: chosen, phone });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafe() });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.matchPassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafe() });
  } catch (err) {
    next(err);
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

router.patch("/me", protect, async (req, res, next) => {
  try {
    const { name, phone, licenceNumber } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (licenceNumber !== undefined) req.user.licenceNumber = licenceNumber;
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

export default router;
