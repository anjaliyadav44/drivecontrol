import { Router } from "express";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import WorkOrder from "../models/WorkOrder.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { healthAlerts } from "../utils/health.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const vehicleFilter = req.user.role === "driver" ? { assignedDriver: req.user._id } : {};
    const vehicles = await Vehicle.find(vehicleFilter).populate("assignedDriver", "name");
    const bookings = await Booking.find({ status: { $in: ["requested", "confirmed"] } })
      .populate("vehicle", "registration")
      .sort({ scheduledAt: 1 })
      .limit(8);
    const workOrders = await WorkOrder.find({ status: { $nin: ["invoiced", "completed"] } })
      .populate("vehicle", "registration")
      .sort({ updatedAt: -1 })
      .limit(8);
    const invoices = await Invoice.find({ status: "issued" }).sort({ dueDate: 1 }).limit(8);

    const outstanding = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const avgHealth = vehicles.length
      ? Math.round(vehicles.reduce((s, v) => s + v.healthScore, 0) / vehicles.length)
      : 0;
    const criticalAlerts = vehicles.flatMap((v) =>
      healthAlerts(v)
        .filter((a) => a.severity === "critical")
        .map((a) => ({ ...a, registration: v.registration, vehicleId: v._id }))
    );

    const drivers = await User.countDocuments({ role: "driver", active: true });

    res.json({
      kpis: {
        fleetSize: vehicles.length,
        avgHealth,
        vor: vehicles.filter((v) => v.healthStatus === "vor").length,
        openBookings: await Booking.countDocuments({ status: { $in: ["requested", "confirmed"] } }),
        openWork: await WorkOrder.countDocuments({ status: { $nin: ["invoiced"] } }),
        outstanding,
        drivers,
      },
      vehicles,
      bookings,
      workOrders,
      invoices,
      criticalAlerts,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
