import { Router } from "express";
import Vehicle from "../models/Vehicle.js";
import HealthLog from "../models/HealthLog.js";
import { protect } from "../middleware/auth.js";
import { healthAlerts } from "../utils/health.js";

const router = Router();
router.use(protect);

router.get("/overview", async (req, res, next) => {
  try {
    const filter = req.user.role === "driver" ? { assignedDriver: req.user._id } : {};
    const vehicles = await Vehicle.find(filter);
    const alerts = vehicles.flatMap((v) =>
      healthAlerts(v).map((a) => ({
        ...a,
        vehicleId: v._id,
        registration: v.registration,
        make: v.make,
        model: v.model,
      }))
    );
    const logs = await HealthLog.find(filter.assignedDriver ? { vehicle: { $in: vehicles.map((v) => v._id) } } : {})
      .populate("vehicle", "registration")
      .sort({ createdAt: -1 })
      .limit(12);
    res.json({
      alerts: alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1)),
      logs,
      counts: {
        healthy: vehicles.filter((v) => v.healthStatus === "healthy").length,
        watch: vehicles.filter((v) => v.healthStatus === "watch").length,
        attention: vehicles.filter((v) => v.healthStatus === "attention").length,
        vor: vehicles.filter((v) => v.healthStatus === "vor").length,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
