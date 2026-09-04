import { Router } from "express";
import Booking from "../models/Booking.js";
import WorkOrder from "../models/WorkOrder.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();
router.use(protect);

function ref(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 99)}`;
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "driver") filter.driver = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate("vehicle", "registration make model healthScore")
      .populate("garage", "name town")
      .populate("driver", "name")
      .sort({ scheduledAt: 1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      reference: ref("BK"),
      createdBy: req.user._id,
      driver: req.body.driver || (req.user.role === "driver" ? req.user._id : undefined),
    });
    const populated = await booking.populate([
      { path: "vehicle", select: "registration make model" },
      { path: "garage", select: "name town" },
    ]);
    res.status(201).json({ booking: populated });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", allow("admin", "fleet_manager", "garage", "driver"), async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("vehicle", "registration make model")
      .populate("garage", "name town");
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/convert", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "converted";
    await booking.save();
    const workOrder = await WorkOrder.create({
      reference: ref("WO"),
      booking: booking._id,
      vehicle: booking.vehicle,
      garage: booking.garage,
      technician: req.user.role === "garage" ? req.user._id : undefined,
      complaint: booking.symptoms,
      status: "queued",
      lines: [],
    });
    res.json({ booking, workOrder });
  } catch (err) {
    next(err);
  }
});

export default router;
