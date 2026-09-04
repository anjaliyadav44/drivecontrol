import { Router } from "express";
import WorkOrder from "../models/WorkOrder.js";
import Invoice from "../models/Invoice.js";
import Vehicle from "../models/Vehicle.js";
import { protect, allow } from "../middleware/auth.js";
import { computeHealth } from "../utils/health.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await WorkOrder.find(filter)
      .populate("vehicle", "registration make model healthScore")
      .populate("garage", "name town")
      .populate("technician", "name")
      .sort({ updatedAt: -1 });
    res.json({ workOrders: orders });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id)
      .populate("vehicle")
      .populate("garage")
      .populate("booking")
      .populate("technician", "name email");
    if (!workOrder) return res.status(404).json({ message: "Work order not found" });
    res.json({ workOrder });
  } catch (err) {
    next(err);
  }
});

router.post("/", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const reference = `WO-${Date.now().toString(36).toUpperCase()}`;
    const workOrder = await WorkOrder.create({ ...req.body, reference });
    res.status(201).json({ workOrder });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ message: "Work order not found" });
    const { status, findings, complaint, lines, technician } = req.body;
    if (status) {
      workOrder.status = status;
      if (status === "in_progress" && !workOrder.startedAt) workOrder.startedAt = new Date();
      if (status === "completed" || status === "ready") workOrder.completedAt = new Date();
    }
    if (findings !== undefined) workOrder.findings = findings;
    if (complaint !== undefined) workOrder.complaint = complaint;
    if (lines) workOrder.lines = lines;
    if (technician) workOrder.technician = technician;
    await workOrder.save();
    res.json({ workOrder });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/lines", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    workOrder.lines.push(req.body);
    if (workOrder.lines.some((l) => !l.authorised)) workOrder.status = "awaiting_auth";
    await workOrder.save();
    res.json({ workOrder });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/authorise", allow("admin", "fleet_manager"), async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    workOrder.lines.forEach((line) => {
      line.authorised = true;
    });
    workOrder.status = "in_progress";
    await workOrder.save();
    res.json({ workOrder });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/invoice", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id).populate("vehicle");
    if (!workOrder) return res.status(404).json({ message: "Work order not found" });
    const items = workOrder.lines.map((l) => ({
      description: l.description,
      qty: l.qty,
      unitPrice: l.unitPrice,
    }));
    const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const tax = Math.round(subtotal * 0.2 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const count = await Invoice.countDocuments();
    const invoice = await Invoice.create({
      number: `DC-${String(count + 101).padStart(5, "0")}`,
      workOrder: workOrder._id,
      vehicle: workOrder.vehicle._id,
      garage: workOrder.garage,
      billedTo: workOrder.vehicle.assignedDriver,
      items,
      subtotal,
      tax,
      total,
      dueDate: new Date(Date.now() + 14 * 86400000),
      status: "issued",
    });
    workOrder.status = "invoiced";
    await workOrder.save();

    const vehicle = await Vehicle.findById(workOrder.vehicle._id);
    if (vehicle) {
      vehicle.lastServiceAt = new Date();
      vehicle.serviceDue = new Date(Date.now() + 180 * 86400000);
      const health = computeHealth(vehicle);
      vehicle.healthScore = health.score;
      vehicle.healthStatus = health.status;
      await vehicle.save();
    }

    res.status(201).json({ invoice, workOrder });
  } catch (err) {
    next(err);
  }
});

export default router;
