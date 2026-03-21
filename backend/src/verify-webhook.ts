import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.UBER_WEBHOOK_SECRET || "sqZ1h8Xo4qo8WSTmEJO2h19gVF7eBpifK7xy2vN8";
const API_URL = `http://localhost:${PORT}/webhooks/uber-eats`;

const testEvent = {
  event_id: "8ee72f37-37f5-412f-ba0f-0a0da549978e",
  event_type: "orders.notification",
  event_time: Math.floor(Date.now() / 1000),
  resource_href: "https://api.uber.com/v1/eats/order/8ee72f37-37f5-412f-ba0f-0a0da549978e",
  meta: {
    resource_id: "8ee72f37-37f5-412f-ba0f-0a0da549978e"
  }
};

const bodyStr = JSON.stringify(testEvent);

const computeSignature = (secret: string, payload: string) => {
  return crypto
    .createHmac("sha256", secret)
    .update(Buffer.from(payload))
    .digest("hex");
};

const signature = computeSignature(WEBHOOK_SECRET, bodyStr);

async function runTest() {
  console.log("🚀 Starting Webhook Signature Verification...");
  console.log("URL:", API_URL);
  console.log("Secret used:", WEBHOOK_SECRET.slice(0, 5) + "...");

  try {
    // Test 1: X-Uber-Signature
    console.log("\n🧪 Test 1: Testing X-Uber-Signature...");
    const resp1 = await axios.post(API_URL, bodyStr, {
      headers: {
        "Content-Type": "application/json",
        "X-Uber-Signature": signature
      }
    });
    console.log("✅ Test 1 Success:", resp1.status);

    // Test 2: X-Uber-Signature-New
    console.log("\n🧪 Test 2: Testing X-Uber-Signature-New...");
    const resp2 = await axios.post(API_URL, bodyStr, {
      headers: {
        "Content-Type": "application/json",
        "X-Uber-Signature-New": signature
      }
    });
    console.log("✅ Test 2 Success:", resp2.status);

    // Test 3: Invalid Signature
    console.log("\n🧪 Test 3: Testing Invalid Signature...");
    try {
      await axios.post(API_URL, bodyStr, {
        headers: {
          "Content-Type": "application/json",
          "X-Uber-Signature": "invalid_sig"
        }
      });
      console.log("❌ Test 3 Failed: Should have returned 401");
    } catch (e: any) {
      if (e.response?.status === 401) {
        console.log("✅ Test 3 Success: Correctly rejected invalid signature (401)");
      } else {
        console.log("❌ Test 3 Failed with unexpected error:", e.message);
      }
    }

    console.log("\n✨ All signature tests passed!");
  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.response) {
      console.error("Response headers:", error.response.headers);
    }
  }
}

runTest();
