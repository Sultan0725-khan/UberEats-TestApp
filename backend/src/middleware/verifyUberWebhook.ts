import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

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

// Interface ensuring `rawBody` is understood by TS
export interface WebhookRequest extends Request {
  rawBody?: Buffer;
}

export const verifyUberWebhook = (
  req: WebhookRequest,
  res: Response,
  next: NextFunction,
) => {
  const rawBody = req.rawBody as Buffer;
  const signatures = getUberSignatures(req.headers);

  const webhookSecret =
    process.env.UBER_WEBHOOK_SIGNING_KEY ||
    process.env.UBER_WEBHOOK_SECRET ||
    process.env.UBER_CLIENT_SECRET;

  if (!rawBody) {
    console.warn("[Middleware] Missing raw body. Cannot compute signature.");
    return res.status(400).send("Bad Request: Missing raw body payload");
  }

  if (!webhookSecret) {
    console.error("[Middleware] FATAL: Missing Webhook Secret in ENV config");
    return res.status(401).send("Unauthorized: Missing Server Configuration");
  }

  if (signatures.length === 0) {
    console.warn("[Middleware] No HMAC signatures provided in headers");
    return res.status(401).send("Unauthorized: Missing signature");
  }

  let isValid = false;

  const expected = computeSignature(webhookSecret, rawBody);
  const expectedBuffer = Buffer.from(expected);

  for (const sig of signatures) {
    const receivedBuffer = Buffer.from(sig);
    // Prevent timing attacks by checking lengths prior to timingSafeEqual
    if (receivedBuffer.length === expectedBuffer.length) {
      if (crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
        isValid = true;
        break;
      }
    }
  }

  if (!isValid) {
    console.warn("[Middleware] Invalid Webhook Signature validation failed.", {
      receivedSignatures: signatures,
    });
    return res.status(401).send("Unauthorized: Invalid signature");
  }

  // Parse body securely to `req.body` specifically from exactly validated raw body
  try {
    req.body = JSON.parse(rawBody.toString("utf8"));
    next();
  } catch (e) {
    console.warn("[Middleware] Invalid JSON extracted from rawBody", e);
    return res.status(400).send("Bad Request: Invalid JSON");
  }
};
