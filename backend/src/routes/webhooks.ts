import { Router } from "express";
import crypto from "crypto";

const router = Router();

// In-memory store for webhook events
// In a real app, this would be a database
const webhookEvents: any[] = [];
const processedEventIds = new Set<string>();

router.post("/uber-eats", (req, res) => {
  try {
    const signatureHeader = req.headers["x-uber-signature"] as string;
    const contentType = req.headers["content-type"];
    const webhookSecret =
      process.env.UBER_WEBHOOK_SIGNING_KEY || process.env.UBER_CLIENT_SECRET;

    console.log(
      `[Webhook] Incoming request. Content-Type: ${contentType}, Signature: ${signatureHeader}, Body Length: ${req.body?.length || 0}`,
    );

    if (!webhookSecret) {
      console.warn("Webhook secret not configured, skipping validation");
    } else if (signatureHeader && req.body && req.body.length > 0) {
      // Validate signature
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.body)
        .digest("hex");

      if (signatureHeader !== expectedSignature) {
        console.error(
          `Invalid Webhook Signature. Expected: ${expectedSignature}, Got: ${signatureHeader}`,
        );
        return res.status(401).send("Invalid signature");
      }
    }

    // Parse the JSON now that signature is validated
    let eventData: any;
    try {
      eventData = JSON.parse(req.body.toString("utf8"));
    } catch (e) {
      return res.status(400).send("Invalid JSON");
    }

    // Extract order_id if it's an orders.notification
    let orderId;
    if (eventData.event_type === "orders.notification") {
      // Typically Uber sends it in meta.resource_id or as part of resource_href
      orderId =
        eventData.meta?.resource_id ||
        eventData.resource_href?.split("/").pop() ||
        "Unknown Order ID";
    }

    const eventId = eventData.event_id || `local_evt_${Date.now()}`;

    // Deduplicate
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId);

      const enrichedEvent = {
        ...eventData,
        order_id: orderId,
        _received_at: new Date().toISOString(),
      };

      // Unshift to keep newest first
      webhookEvents.unshift(enrichedEvent);

      // Keep only last 100 events
      if (webhookEvents.length > 100) {
        webhookEvents.pop();
      }

      console.log(
        `[Webhook] Received ${eventData.event_type} - Event ID: ${eventId}, Order ID: ${orderId}`,
      );
      if (eventData.event_type === "orders.notification") {
        console.log("[Webhook] Full Body:", JSON.stringify(eventData, null, 2));
      }
    } else {
      console.log(`[Webhook] Duplicate event ignored - Event ID: ${eventId}`);
    }

    // Acknowledge receipt - Uber docs say empty body
    res.status(200).send();
  } catch (error) {
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

export default router;
