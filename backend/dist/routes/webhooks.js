"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// In-memory store for webhook events
// In a real app, this would be a database
const webhookEvents = [];
const processedEventIds = new Set();
router.post("/uber-eats", (req, res) => {
    try {
        const signatureHeader = req.headers["x-uber-signature"];
        const webhookSecret = process.env.UBER_WEBHOOK_SECRET || process.env.UBER_CLIENT_SECRET;
        if (!webhookSecret) {
            console.warn("Webhook secret not configured, skipping validation");
        }
        else if (signatureHeader && req.body) {
            // Validate signature
            // req.body here MUST be the raw Buffer if express.raw() is used
            const expectedSignature = crypto_1.default
                .createHmac("sha256", webhookSecret)
                .update(req.body)
                .digest("hex");
            if (signatureHeader !== expectedSignature) {
                console.error(`Invalid Webhook Signature. Expected: ${expectedSignature}, Got: ${signatureHeader}`);
                // Uber expects a 200 even on errors sometimes, or 401. Let's return 401 for safety.
                return res.status(401).send("Invalid signature");
            }
        }
        // Parse the JSON now that signature is validated
        let eventData;
        try {
            eventData = JSON.parse(req.body.toString("utf8"));
        }
        catch (e) {
            return res.status(400).send("Invalid JSON");
        }
        const eventId = eventData.event_id || `local_evt_${Date.now()}`;
        // Deduplicate
        if (!processedEventIds.has(eventId)) {
            processedEventIds.add(eventId);
            const enrichedEvent = {
                ...eventData,
                _received_at: new Date().toISOString(),
            };
            // Unshift to keep newest first
            webhookEvents.unshift(enrichedEvent);
            // Keep only last 100 events
            if (webhookEvents.length > 100) {
                webhookEvents.pop();
            }
            console.log(`[Webhook] Received ${eventData.event_type} - Event ID: ${eventId}`);
        }
        else {
            console.log(`[Webhook] Duplicate event ignored - Event ID: ${eventId}`);
        }
        // Acknowledge receipt
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Endpoint for the frontend to poll events
router.get("/events", (req, res) => {
    res.json({ events: webhookEvents });
});
// Endpoint to clear events
router.delete("/events", (req, res) => {
    webhookEvents.length = 0;
    processedEventIds.clear();
    res.json({ success: true });
});
exports.default = router;
