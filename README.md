# Uber Eats Sandbox Integration App

A complete, beautifully designed local web application to test the complete Uber Eats Marketplace API end-to-end order flow in the Sandbox environment.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=Uber+Eats+Sandbox+App)

## Features

- **OAuth Management**: Generate sandbox tokens easily, automatically injected into all subsequent API calls.
- **Store & Menu API**: Query your stores, fetch status, update details, retrieve and upload menus.
- **Order Flow Simulation**: Fetch active created orders, accept, deny, or cancel them with a swagger-like interface.
- **Live Webhook Timeline**: Automatically validate `X-Uber-Signature`, deduplicate events, and view incoming webhooks (e.g., `orders.notification`) in real-time.
- **Premium Developer UI**: Clean, responsive, dark-mode Swagger alternative with JSON formatting and one-click copy functionality.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- An Uber Developer Account with Sandbox configuration

## Getting Started

### 1. Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your details:
   - `UBER_CLIENT_ID`
   - `UBER_CLIENT_SECRET`
   - `UBER_WEBHOOK_SECRET` (Use your client secret if a specific webhook secret isn't provided)
   - Define your test store IDs (e.g., Pizza Love, Smash Burger)

### 2. Starting the Backend

The backend acts as an API Proxy to bypass CORS and handles OAuth Token injection.

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:3000`.

### 3. Starting the Frontend

The React frontend provides the UI for your testing.

```bash
cd frontend
npm install
npm run dev
```

The app will become available at `http://localhost:5173`. Open this in your browser.

---

## Testing Webhooks Locally

To receive webhooks on your local machine, Uber's servers need a public URL to send the payload to.

### Using Cloudflared (Recommended)

1. Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Start a tunnel pointing to the backend's port 3000:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. Copy the generated `https://something.trycloudflare.com` URL.
4. Go to your Uber Developer Dashboard -> Settings -> Webhooks.
5. Set the Webhook URL to: `https://something.trycloudflare.com/webhooks`

### Using ngrok

1. Install [ngrok](https://ngrok.com/).
2. Run the tunnel:
   ```bash
   ngrok http 3000
   ```
3. Copy the `https://xxxx-xx.ngrok.app` URL.
4. Configure your Uber Dashboard Webhook URL to: `https://xxxx-xx.ngrok.app/webhooks`

## Architecture

- **`backend/`**: Express server handling API proxying to `test-api.uber.com`, OAuth flow to `sandbox-login.uber.com`, and a webhook receiver endpoint that validates HMAC SHA256 signatures.
- **`frontend/`**: Vite + React + TailwindCSS providing an interactive API explorer and a live-polling webhook timeline.
