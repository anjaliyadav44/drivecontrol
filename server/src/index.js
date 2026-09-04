import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import User from "./models/User.js";
import { seedIfEmpty } from "./seed.js";
import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";
import garageRoutes from "./routes/garages.js";
import bookingRoutes from "./routes/bookings.js";
import workOrderRoutes from "./routes/workOrders.js";
import invoiceRoutes from "./routes/invoices.js";
import paymentRoutes from "./routes/payments.js";
import healthRoutes from "./routes/health.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";

if (!process.env.CLIENT_URL && process.env.RENDER_EXTERNAL_URL) {
  process.env.CLIENT_URL = process.env.RENDER_EXTERNAL_URL;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../../client/dist");
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

app.get("/api/healthcheck", (req, res) => {
  res.json({ ok: true, name: "DriveControl", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/garages", garageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

if (isProd) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDb()
  .then(async () => {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log("Empty database — loading demo fleet…");
      await seedIfEmpty();
    }
    app.listen(port, "0.0.0.0", () => {
      console.log(`DriveControl running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start", err);
    process.exit(1);
  });
