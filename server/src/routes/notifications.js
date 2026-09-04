import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

export default router;
