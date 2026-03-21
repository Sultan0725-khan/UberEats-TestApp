import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uberRoutes from "./routes/uber";
import webhookRoutes from "./routes/webhooks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// 🔥 IMPORTANT: raw body MUST be captured BEFORE ANY JSON parsing
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;

      console.log("🧪 RAW BODY CAPTURED:", buf.toString("utf8"));
    },
  }),
);

// Global logger (debug only)
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// -------------------- ROUTES --------------------
app.use("/api/uber", uberRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/webhooks", webhookRoutes);
app.use("/", webhookRoutes);

// -------------------- DEBUG ENDPOINT --------------------
app.get("/api/webhooks/self-test", (req, res) => {
  const hasKey = !!(
    process.env.UBER_WEBHOOK_SIGNING_KEY || process.env.UBER_CLIENT_SECRET
  );

  res.json({
    status: "ok",
    webhookConfigured: hasKey,
    keyUsed: process.env.UBER_WEBHOOK_SIGNING_KEY
      ? "UBER_WEBHOOK_SIGNING_KEY"
      : "UBER_CLIENT_SECRET",
    rawBodyEnabled: true,
    message:
      "Webhook handler is active and raw-body parsing is enabled for /webhooks/uber-eats",
  });
});

// -------------------- HEALTH --------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
