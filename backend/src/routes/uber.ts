import { Router } from "express";
import axios from "axios";

const router = Router();

// In-memory token storage for sandbox testing
let currentToken = {
  access_token: "",
  expires_in: 0,
  token_type: "",
  scope: "",
  obtained_at: 0,
};

// Helper to get base URL
const getBaseUrl = () =>
  process.env.UBER_BASE_URL || "https://test-api.uber.com";

// Generic axios instance for Uber API
const uberApi = axios.create();

uberApi.interceptors.request.use((config) => {
  if (currentToken.access_token) {
    config.headers.Authorization = `Bearer ${currentToken.access_token}`;
  }
  return config;
});

// 1. Get OAuth Token
router.post("/auth/token", async (req, res) => {
  try {
    const { client_id, client_secret, scope } = req.body;

    // Ensure we use the correct auth URL
    const authUrl =
      process.env.UBER_AUTH_URL ||
      "https://sandbox-login.uber.com/oauth/v2/token";

    const params = new URLSearchParams();
    params.append("client_id", client_id || process.env.UBER_CLIENT_ID || "");
    params.append(
      "client_secret",
      client_secret || process.env.UBER_CLIENT_SECRET || "",
    );
    params.append("grant_type", "client_credentials");
    if (scope) params.append("scope", scope);

    const startTime = Date.now();
    const response = await axios.post(authUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const latency = Date.now() - startTime;

    currentToken = {
      ...response.data,
      obtained_at: Date.now(),
    };

    res.json({
      data: currentToken,
      meta: { status: response.status, latency },
    });
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      meta: { status: error.response?.status || 500, latency: 0 },
    });
  }
});

// Auto-fetch token helper
const autoFetchToken = async () => {
  const authUrl =
    process.env.UBER_AUTH_URL ||
    "https://sandbox-login.uber.com/oauth/v2/token";
  const params = new URLSearchParams();
  params.append("client_id", process.env.UBER_CLIENT_ID || "");
  params.append("client_secret", process.env.UBER_CLIENT_SECRET || "");
  params.append("grant_type", "client_credentials");
  params.append(
    "scope",
    "eats.order eats.store eats.store.orders.read eats.store.status.write",
  );

  const response = await axios.post(authUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  currentToken = {
    ...response.data,
    obtained_at: Date.now(),
  };
  console.log("✅ Auto-fetched new Uber API token");
};

// Helper for proxying requests to Uber API and calculating latency/status
const proxyRequest = async (
  req: any,
  res: any,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: any,
) => {
  const startTime = Date.now();
  // Allow frontend to override base URL via header
  const baseUrl = req.headers["x-uber-base-url"] || getBaseUrl();

  // Check if token is missing or expired (with 60s buffer)
  const isExpired =
    !currentToken.access_token ||
    Date.now() - currentToken.obtained_at >
      ((currentToken.expires_in || 2592000) - 60) * 1000;

  if (isExpired) {
    try {
      await autoFetchToken();
    } catch (tokenErr: any) {
      console.error(
        "❌ Failed to auto-fetch token:",
        tokenErr.response?.data || tokenErr.message,
      );
    }
  }

  try {
    const response = await uberApi({
      method,
      url: `${baseUrl}${url}`,
      data,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const latency = Date.now() - startTime;
    res.json({
      data: response.data,
      meta: { status: response.status, latency },
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      meta: { status: error.response?.status || 500, latency },
    });
  }
};

// 2. STORES
router.get("/stores", (req, res) => {
  proxyRequest(req, res, "GET", "/v1/eats/stores");
});

router.get("/stores/:store_id", (req, res) => {
  proxyRequest(req, res, "GET", `/v1/eats/stores/${req.params.store_id}`);
});

router.get("/stores/:store_id/status", (req, res) => {
  // Pass query params from frontend if any
  const qs = new URLSearchParams(
    req.query as Record<string, string>,
  ).toString();
  const path = `/v1/eats/store/${req.params.store_id}/status${qs ? `?${qs}` : ""}`;
  proxyRequest(req, res, "GET", path);
});

router.post("/stores/:store_id/status", (req, res) => {
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/eats/store/${req.params.store_id}/status`,
    req.body,
  );
});

router.get("/stores/:store_id/holiday-hours", (req, res) => {
  proxyRequest(
    req,
    res,
    "GET",
    `/v1/eats/stores/${req.params.store_id}/holiday-hours`,
  );
});

router.post("/stores/:store_id/holiday-hours", (req, res) => {
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/eats/stores/${req.params.store_id}/holiday-hours`,
    req.body,
  );
});

// 3. MENUS
router.get("/stores/:store_id/menus", (req, res) => {
  proxyRequest(req, res, "GET", `/v2/eats/stores/${req.params.store_id}/menus`);
});

router.put("/stores/:store_id/menus", (req, res) => {
  // Upload menu
  proxyRequest(
    req,
    res,
    "PUT",
    `/v2/eats/stores/${req.params.store_id}/menus`,
    req.body,
  );
});

router.post("/stores/:store_id/menus/items/:item_id", (req, res) => {
  // Update Menu Item
  proxyRequest(
    req,
    res,
    "POST",
    `/v2/eats/stores/${req.params.store_id}/menus/items/${req.params.item_id}`,
    req.body,
  );
});

// 4. ORDERS
router.get("/stores/:store_id/created-orders", (req, res) => {
  proxyRequest(
    req,
    res,
    "GET",
    `/v1/eats/stores/${req.params.store_id}/created-orders`,
  );
});

router.get("/orders/:order_id", (req, res) => {
  proxyRequest(req, res, "GET", `/v2/eats/order/${req.params.order_id}`);
});

router.post("/orders/:order_id/accept_pos_order", (req, res) => {
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/eats/orders/${req.params.order_id}/accept_pos_order`,
    req.body,
  );
});

router.post("/orders/:order_id/cancel", (req, res) => {
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/eats/orders/${req.params.order_id}/cancel`,
    req.body,
  );
});

router.post("/orders/:order_id/deny", (req, res) => {
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/eats/orders/${req.params.order_id}/deny_pos_order`,
    req.body,
  );
});

router.post("/orders/:order_id/ready", (req, res) => {
  // Update Delivery Status (Restaurant Ready)
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/delivery/order/${req.params.order_id}/ready`,
    req.body,
  );
});

router.post("/orders/:order_id/update-ready-time", (req, res) => {
  // Update Order Ready Time
  proxyRequest(
    req,
    res,
    "POST",
    `/v1/delivery/order/${req.params.order_id}/update-ready-time`,
    req.body,
  );
});

export default router;
