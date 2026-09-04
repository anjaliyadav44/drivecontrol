import { Router } from "express";
import Garage from "../models/Garage.js";
import { protect, allow } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const garages = await Garage.find(req.query.q ? { name: new RegExp(req.query.q, "i") } : {}).sort({ rating: -1 });
    res.json({ garages });
  } catch (err) {
    next(err);
  }
});

router.post("/", allow("admin", "fleet_manager"), async (req, res, next) => {
  try {
    const garage = await Garage.create(req.body);
    res.status(201).json({ garage });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", allow("admin", "fleet_manager", "garage"), async (req, res, next) => {
  try {
    const garage = await Garage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ garage });
  } catch (err) {
    next(err);
  }
});

export default router;
