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

// Global logger to help debug incoming test webhooks that hit the wrong path
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Use raw body parsing for the webhook route to verify signatures
// We use a function to match any content-type for this specific path
app.use("/webhooks/uber-eats", express.raw({ type: "*/*" }));
app.use(express.json());

// Routes
app.use("/api/uber", uberRoutes);
app.use("/api/webhooks", webhookRoutes); // Frontend polling
app.use("/webhooks", webhookRoutes); // External Uber delivery url

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
    message:
      "Webhook handler is active and raw-body parsing is enabled for /webhooks/uber-eats",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
