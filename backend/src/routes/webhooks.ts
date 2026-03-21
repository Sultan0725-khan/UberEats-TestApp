import { Router } from "express";
import { verifyUberWebhook } from "../middleware/verifyUberWebhook";
import {
  idempotencyService,
  UberWebhookEvent,
} from "../services/idempotencyService";
import { webhookWorker } from "../workers/webhookWorker";

const router = Router();

/* -------------------- INGESTION CONTROLLER (API BOUNDARY) -------------------- */

// The verifyUberWebhook middleware securely guarantees valid signatures and JSON body
router.post("/", verifyUberWebhook, (req, res) => {
  const event = req.body as UberWebhookEvent;

  if (!event || !event.event_id || !event.event_type) {
    console.warn("[Ingestion] Bad Request: Webhook structure invalidly formed");
    return res.status(400).send("Bad Request: Missing event_id or event_type");
  }

  // 1. Critical Pattern: Idempotency Check Layer
  const isNewEvent = idempotencyService.acquireLock(event.event_id);

  if (!isNewEvent) {
    console.info(
      `[Idempotency] Duplicate webhook blocked and gracefully ignored: ${event.event_id}`,
    );
    // Mandatory logic: Ensure Uber immediately considers the duplicate fulfilled to stop retry storms.
    return res.status(200).send("Already processed");
  }

  // 2. Safely capture the valid payload into Database
  idempotencyService.saveEvent(event);

  // 3. Queue logic: Decouple from Node HTTP Event loop and handoff heavy computation
  webhookWorker.enqueue(event);

  console.info(
    `[Ingestion] Webhook ingestion accepted & enqueued: ${event.event_type} (${event.event_id})`,
  );

  // 4. Return reliable, rapid 200 OK (< 2000 ms strictly per Uber constraints)
  return res.status(200).send("Event received successfully");
});

/* -------------------- DATA RETRIEVAL LOGIC (CLIENT FACING DB API) -------------------- */
// Provided for Webhook UI representation tracking statuses (`pending`, `completed`)

router.get("/events", (_req, res) => {
  const events = idempotencyService.getEvents();
  return res.json({ events: events, count: events.length });
});

router.delete("/events", (_req, res) => {
  idempotencyService.clearAll();
  console.log("[Webhook UI] Cleared all stored events manually.");
  return res.json({ success: true, cleared: true });
});

export default router;
