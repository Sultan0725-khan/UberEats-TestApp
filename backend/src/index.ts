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
// Use raw body parsing for the webhook route to verify signatures
app.use("/webhooks/uber-eats", express.raw({ type: "application/json" }));
app.use(express.json());

// Routes
app.use("/api/uber", uberRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
