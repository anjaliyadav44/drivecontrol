import { Router } from "express";
import User from "../models/User.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password").populate("garageId", "name").sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", allow("admin", "fleet_manager"), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { name, role, phone, active, garageId, licenceNumber } = req.body;
    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (active !== undefined) user.active = active;
    if (garageId !== undefined) user.garageId = garageId;
    if (licenceNumber !== undefined) user.licenceNumber = licenceNumber;
    await user.save();
    res.json({ user: user.toSafe() });
  } catch (err) {
    next(err);
  }
});

export default router;
