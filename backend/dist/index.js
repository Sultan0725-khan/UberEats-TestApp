"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const uber_1 = __importDefault(require("./routes/uber"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
// Use raw body parsing for the webhook route to verify signatures
app.use("/webhooks", express_1.default.raw({ type: "application/json" }));
app.use(express_1.default.json());
// Routes
app.use("/api/uber", uber_1.default);
app.use("/api/webhooks", webhooks_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
