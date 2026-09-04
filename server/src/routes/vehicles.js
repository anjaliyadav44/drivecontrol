import { Router } from "express";
import Vehicle from "../models/Vehicle.js";
import HealthLog from "../models/HealthLog.js";
import { protect, allow } from "../middleware/auth.js";
import { computeHealth, healthAlerts } from "../utils/health.js";

const router = Router();
router.use(protect);

function canSeeVehicle(user, vehicle) {
  if (user.role === "admin" || user.role === "fleet_manager" || user.role === "garage") return true;
  return String(vehicle.assignedDriver) === String(user._id);
}

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "driver") filter.assignedDriver = req.user._id;
    if (req.query.q) {
      filter.$or = [
        { registration: new RegExp(req.query.q, "i") },
        { make: new RegExp(req.query.q, "i") },
        { model: new RegExp(req.query.q, "i") },
      ];
    }
    if (req.query.status) filter.healthStatus = req.query.status;
    const vehicles = await Vehicle.find(filter)
      .populate("assignedDriver", "name email phone")
      .populate("preferredGarage", "name town")
      .sort({ healthScore: 1 });
    res.json({ vehicles: vehicles.map((v) => ({ ...v.toObject(), alerts: healthAlerts(v) })) });
  } catch (err) {
    next(err);
  }
});

router.post("/", allow("admin", "fleet_manager"), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    const health = computeHealth(vehicle);
    vehicle.healthScore = health.score;
    vehicle.healthStatus = health.status;
    await vehicle.save();
    res.status(201).json({ vehicle });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Registration already exists" });
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate("assignedDriver", "name email phone licenceNumber")
      .populate("preferredGarage", "name town phone");
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (!canSeeVehicle(req.user, vehicle)) return res.status(403).json({ message: "Access denied" });
    const logs = await HealthLog.find({ vehicle: vehicle._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ vehicle, alerts: healthAlerts(vehicle), logs });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const fields = [
      "registration", "vin", "make", "model", "year", "color", "fuelType", "mileage",
      "assignedDriver", "preferredGarage", "components", "vor", "motDue", "serviceDue",
      "insuranceDue", "taxDue", "lastServiceAt", "notes",
    ];
    for (const key of fields) {
      if (req.body[key] !== undefined) vehicle[key] = req.body[key];
    }
    const health = computeHealth(vehicle);
    vehicle.healthScore = health.score;
    vehicle.healthStatus = health.status;
    await vehicle.save();
    res.json({ vehicle, alerts: healthAlerts(vehicle) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", allow("admin", "fleet_manager"), async (req, res, next) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/documents", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    vehicle.documents.push({ name: req.body.name, kind: req.body.kind || "other" });
    await vehicle.save();
    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/scan", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (req.body.components) vehicle.components = { ...vehicle.components.toObject?.() || vehicle.components, ...req.body.components };
    if (req.body.mileage) vehicle.mileage = req.body.mileage;
    const health = computeHealth(vehicle);
    vehicle.healthScore = health.score;
    vehicle.healthStatus = health.status;
    await vehicle.save();
    const log = await HealthLog.create({
      vehicle: vehicle._id,
      source: "scan",
      mileage: vehicle.mileage,
      components: vehicle.components,
      score: health.score,
      notes: req.body.notes,
      recordedBy: req.user._id,
    });
    res.json({ vehicle, log, alerts: healthAlerts(vehicle) });
  } catch (err) {
    next(err);
  }
});

export default router;
