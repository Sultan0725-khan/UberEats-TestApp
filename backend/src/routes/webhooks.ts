import { Router } from "express";
import crypto from "crypto";

const router = Router();

/* -------------------- TYPES -------------------- */

interface WebhookMeta {
  client_id?: string;
  webhook_config_id?: string;
  webhook_msg_timestamp?: number;
  webhook_msg_uuid?: string;
}

interface UberWebhookEvent {
  event_id: string;
  event_type: string;
  event_time: number;
  resource_href: string;
  meta?: { resource_id?: string; user_id?: string };
  webhook_meta?: WebhookMeta;
  [key: string]: any;
}

/* -------------------- DEBUG LOGGER -------------------- */

const debugLog = (title: string, data?: Record<string, any>) => {
  const time = new Date().toISOString();
  console.log(`[Webhook][${time}] ${title}`, data ?? "");
};

/* -------------------- STORAGE -------------------- */

// In-memory event storage
const storedEvents: UberWebhookEvent[] = [];
const processedEventIds = new Set<string>();

/* -------------------- VALIDATION HELPERS -------------------- */

const VALID_EVENT_TYPES = new Set([
  "orders.notification",
  "orders.scheduled.notification",
  "orders.release",
  "orders.failure",
  "orders.cancel",
  "store.provisioned",
  "store.deprovisioned",
  "order.fulfillment_issues.resolved",
  "delivery.state_changed",
  "store.status.changed",
]);

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  );

const isValidURI = (uri: string) => {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
};

/* -------------------- SIGNATURE -------------------- */

/**
 * Compute HMAC-SHA256 signature (equivalent to Python's hmac.new(...).hexdigest())
 *
 * Python equivalent:
 * digester = hmac.new(client_secret, webhook_body, hashlib.sha256)
 * return digester.hexdigest()
 */
const computeSignature = (
  clientSecret: string,
  webhookBody: Buffer,
): string => {
  return crypto
    .createHmac("sha256", clientSecret)
    .update(webhookBody)
    .digest("hex");
};

const getUberSignatures = (headers: Record<string, any>): string[] => {
  const sigs: string[] = [];
  const keys = ["x-uber-signature", "x-uber-signature-new"];

  for (const k of keys) {
    const val = headers[k];
    if (val) {
      if (Array.isArray(val)) sigs.push(...val);
      else sigs.push(val as string);
    }
  }

  return sigs;
};

const validateSignature = (
  rawBody: Buffer,
  received: string | undefined,
  secret: string | undefined,
) => {
  if (!secret) return { valid: false, reason: "missing-secret" };
  if (!received) return { valid: false, reason: "missing-signature" };

  const expected = computeSignature(secret, rawBody);

  console.log("🔐 HMAC DEBUG FULL:", {
    secretExists: !!secret,
    received: received,
    expected: expected,
    rawBodyPreview: rawBody.toString("utf8").slice(0, 200),
  });

  const a = Buffer.from(received);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return { valid: false, reason: "signature-length-mismatch" };
  }

  return {
    valid: crypto.timingSafeEqual(a, b),
    reason: "invalid-signature",
  };
};

/* -------------------- SPEC VALIDATION -------------------- */

const validateEvent = (event: UberWebhookEvent) => {
  if (!event.event_id || !isValidUUID(event.event_id))
    return { valid: false, reason: "invalid-event_id" };

  if (!event.event_type || !VALID_EVENT_TYPES.has(event.event_type))
    return { valid: false, reason: "invalid-event_type" };

  if (!event.event_time || typeof event.event_time !== "number")
    return { valid: false, reason: "invalid-event_time" };

  if (!event.resource_href || !isValidURI(event.resource_href))
    return { valid: false, reason: "invalid-resource_href" };

  return { valid: true };
};

/* -------------------- ROUTE -------------------- */

router.post(["/"], async (req: any, res) => {
  const rawBody = req.rawBody as Buffer;
  const signatures = getUberSignatures(req.headers);

  const webhookSecret =
    process.env.UBER_WEBHOOK_SIGNING_KEY ||
    process.env.UBER_WEBHOOK_SECRET ||
    process.env.UBER_CLIENT_SECRET;

  /* 🔥 INCOMING DEBUG */
  debugLog("Incoming request", {
    path: req.originalUrl,
    bodyLength: rawBody?.length || 0,
    sigsFound: signatures.length,
  });

  console.log("HEADERS:", req.headers);

  if (!rawBody) {
    debugLog("Missing raw body");
    return res.status(400).send("Missing raw body");
  }

  /* 🔐 SIGNATURE CHECK */
  let sigValidation = { valid: false, reason: "missing-signature" };
  let usedSignature = "";

  if (signatures.length > 0) {
    for (const sig of signatures) {
      const result = validateSignature(rawBody, sig, webhookSecret);
      if (result.valid) {
        sigValidation = result;
        usedSignature = sig;
        break;
      } else {
        sigValidation = result; // Preserve failure reason
      }
    }
  }

  if (!sigValidation.valid) {
    debugLog("Signature validation failed", {
      reason: sigValidation.reason,
      signaturesFound: signatures,
    });

    console.log("RAW BODY:", rawBody.toString("utf8"));
    console.log("HEADERS:", req.headers);

    return res.status(401).send("Invalid signature");
  }

  debugLog("Signature validation OK", { usedSignature });

  /* 📦 PARSE */
  let event: UberWebhookEvent;

  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    debugLog("Invalid JSON payload");
    return res.status(400).send("Invalid JSON");
  }

  /* 🧪 VALIDATE */
  const validation = validateEvent(event);

  if (!validation.valid) {
    debugLog("Spec validation failed", {
      reason: validation.reason,
    });
    return res.status(400).send("Invalid event");
  }

  /* 🎯 SUCCESS */
  debugLog("Webhook accepted", {
    event_id: event.event_id,
    event_type: event.event_type,
  });

  // Deduplicate - only store if new
  if (!processedEventIds.has(event.event_id)) {
    processedEventIds.add(event.event_id);
    storedEvents.unshift(event);

    // Keep only last 100 events
    if (storedEvents.length > 100) {
      storedEvents.pop();
    }
  }

  return res.status(200).send();
});

/* -------------------- GET/DELETE ENDPOINTS -------------------- */

router.get("/events", (_req, res) => {
  return res.json({ events: storedEvents, count: storedEvents.length });
});

router.delete("/events", (_req, res) => {
  storedEvents.length = 0;
  processedEventIds.clear();
  debugLog("Cleared all events");
  return res.json({ success: true, cleared: true });
});

/* -------------------- EXPORT FOR TESTING -------------------- */
export { computeSignature, validateSignature };

export default router;
