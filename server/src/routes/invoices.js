import { Router } from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "driver") filter.billedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    const invoices = await Invoice.find(filter)
      .populate("vehicle", "registration make model")
      .populate("garage", "name")
      .populate("billedTo", "name email")
      .sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("vehicle")
      .populate("garage")
      .populate("workOrder")
      .populate("billedTo", "name email");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

export default router;
