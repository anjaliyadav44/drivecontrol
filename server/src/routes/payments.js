import { Router } from "express";
import Stripe from "stripe";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import { protect } from "../middleware/auth.js";

const router = Router();

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

router.get("/", protect, async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate({ path: "invoice", populate: { path: "vehicle", select: "registration" } })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ payments, stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY) });
  } catch (err) {
    next(err);
  }
});

router.post("/demo", protect, async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (invoice.status === "paid") return res.status(400).json({ message: "Invoice already paid" });
    const last4 = (req.body.cardNumber || "4242").replace(/\s/g, "").slice(-4);
    const payment = await Payment.create({
      invoice: invoice._id,
      amount: invoice.total,
      method: "demo",
      status: "succeeded",
      last4,
      paidBy: req.user._id,
    });
    invoice.status = "paid";
    invoice.paidAt = new Date();
    await invoice.save();
    res.json({ payment, invoice });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", protect, async (req, res, next) => {
  try {
    const stripe = stripeClient();
    const invoice = await Invoice.findById(req.body.invoiceId).populate("vehicle", "registration");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (!stripe) {
      return res.status(400).json({
        message: "Stripe keys are not configured. Use demo card payment, or add STRIPE_SECRET_KEY.",
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/app/payments?paid=${invoice._id}`,
      cancel_url: `${process.env.CLIENT_URL}/app/invoices/${invoice._id}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: invoice.currency || "gbp",
            unit_amount: Math.round(invoice.total * 100),
            product_data: {
              name: `DriveControl invoice ${invoice.number}`,
              description: invoice.vehicle?.registration || "Vehicle service",
            },
          },
        },
      ],
      metadata: { invoiceId: String(invoice._id) },
    });
    await Payment.create({
      invoice: invoice._id,
      amount: invoice.total,
      method: "stripe",
      status: "pending",
      stripeSessionId: session.id,
      paidBy: req.user._id,
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

export default router;
