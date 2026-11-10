import { Router } from "express";
import { verifyUberWebhook } from "../middleware/verifyUberWebhook";
import {
  idempotencyService,
  UberWebhookEvent,
} from "../services/idempotencyService";
import { webhookWorker } from "../workers/webhookWorker";

const router = Router();

/* -------------------- INGESTION CONTROLLER (API BOUNDARY) -------------------- */

/**
 * Optional relay to the B2B Core (B2B-040): Uber allows one delivery URL per app, so the Test App can sit in front
 * and pass every verified webhook on unchanged. Core verifies the signature again, therefore the raw body and the
 * signature headers are forwarded untouched. Fire and forget: a slow or failing Core never delays the answer to Uber.
 */
function forwardToCore(req: any): void {
  const target = process.env.FORWARD_WEBHOOK_URL;
  if (!target || !req.rawBody) {
    return;
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  for (const name of ["x-uber-signature", "x-uber-signature-new"]) {
    const value = req.headers[name];
    if (typeof value === "string") {
      headers[name] = value;
    }
  }
  fetch(target, { method: "POST", headers, body: req.rawBody })
    .then((response) =>
      console.info(`[Relay] Core answered ${response.status} for ${req.body?.event_id}`),
    )
    .catch((error) =>
      console.warn(`[Relay] Could not forward ${req.body?.event_id}: ${error.message}`),
    );
}

// The verifyUberWebhook middleware securely guarantees valid signatures and JSON body
router.post("/", verifyUberWebhook, (req, res) => {
  const event = req.body as UberWebhookEvent;

  if (!event || !event.event_id || !event.event_type) {
    console.warn("[Ingestion] Bad Request: Webhook structure invalidly formed");
    return res.status(400).send("Bad Request: Missing event_id or event_type");
  }

  forwardToCore(req);

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
