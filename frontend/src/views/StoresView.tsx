import React, { useState } from "react";
import { EndpointPanel } from "../components/EndpointPanel";
import api from "../lib/api";

export const StoresView = () => {
  const [storeId, setStoreId] = useState(
    "e269b9b3-e859-47b5-a9da-d82ce41139be",
  ); // Default Pizza Love
  const [baseUrl, setBaseUrl] = useState("https://test-api.uber.com");

  // Helper to execute with custom base URL header
  const executeWithBaseUrl = (method: string, url: string, body?: any) => {
    const config = {
      headers: {
        "x-uber-base-url": baseUrl,
      },
    };

    if (method === "GET") {
      return api.get(url, config).then((res) => res.data);
    } else {
      return api.post(url, body, config).then((res) => res.data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Stores API
          </h1>
          <p className="text-textMuted mt-1">
            Manage and query store status and details.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-textMuted font-semibold uppercase tracking-wider ml-1">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-surface border border-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="https://test-api.uber.com"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-textMuted font-semibold uppercase tracking-wider ml-1">
              Store ID
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full bg-surface border border-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter Store UUID..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <EndpointPanel
          title="Get Stores"
          description="Fetch a list of all stores associated with your developer account. Requires eats.store or eats.pos_provisioning scope."
          method="GET"
          displayEndpoint="{{base_url}}/v1/eats/stores"
          endpoint="/api/uber/stores"
          onExecute={() => executeWithBaseUrl("GET", "/api/uber/stores")}
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with at least one of the{" "}
            <code className="text-secondary">eats.store</code>;{" "}
            <code className="text-secondary">eats.pos_provisioning</code>{" "}
            scopes.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Get Store Details"
          description="Fetch full details for a specific store. Requires eats.store scope."
          method="GET"
          displayEndpoint={`{{base_url}}/v1/eats/stores/${storeId}`}
          endpoint={`/api/uber/stores/${storeId}`}
          onExecute={() =>
            executeWithBaseUrl("GET", `/api/uber/stores/${storeId}`)
          }
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with the{" "}
            <code className="text-secondary">eats.store</code> scope.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Get Store Status"
          description="Check if a store is online or paused. Requires eats.store scope."
          method="GET"
          displayEndpoint={`{{base_url}}/v1/eats/store/${storeId}/status?client_secret=●●●●●●`}
          endpoint={`/api/uber/stores/${storeId}/status`}
          onExecute={() =>
            executeWithBaseUrl("GET", `/api/uber/stores/${storeId}/status`)
          }
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with the{" "}
            <code className="text-secondary">eats.store</code> scope.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Set Store Status"
          description="Update restaurant status. Requires eats.store.status.write scope."
          method="POST"
          displayEndpoint={`{{base_url}}/v1/eats/store/${storeId}/status`}
          endpoint={`/api/uber/stores/${storeId}/status`}
          defaultBody={{
            status: "ONLINE",
            paused_until: "2024-12-31T23:59:59Z",
            reason: "Maintenance",
          }}
          onExecute={(body) =>
            executeWithBaseUrl(
              "POST",
              `/api/uber/stores/${storeId}/status`,
              body,
            )
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.store.status.write</code>{" "}
              scope.
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-1">Allowed Values:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>
                  <strong>status:</strong> ONLINE (Accepting orders), PAUSED
                  (Unavailable)
                </li>
                <li>
                  <strong>paused_until:</strong> YYYY-MM-DDTHH:MM:SSZ
                </li>
                <li>
                  <strong>reason:</strong> Description for the status change
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Get Store Holiday Hours"
          description="Fetch holiday hours for a specific store. Requires eats.store scope."
          method="GET"
          displayEndpoint={`{{base_url}}/v1/eats/stores/${storeId}/holiday-hours`}
          endpoint={`/api/uber/stores/${storeId}/holiday-hours`}
          onExecute={() =>
            executeWithBaseUrl(
              "GET",
              `/api/uber/stores/${storeId}/holiday-hours`,
            )
          }
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with the{" "}
            <code className="text-secondary">eats.store</code> scope.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Set Store Holiday Hours"
          description="Update or set holiday hours for a specific store. Requires eats.store scope."
          method="POST"
          displayEndpoint={`{{base_url}}/v1/eats/stores/${storeId}/holiday-hours`}
          endpoint={`/api/uber/stores/${storeId}/holiday-hours`}
          defaultBody={{
            holiday_hours: {
              "2020-12-23": {
                open_time_periods: [
                  {
                    start_time: "9:00",
                    end_time: "12:00",
                  },
                ],
              },
              "2020-12-24": {
                open_time_periods: [
                  {
                    start_time: "00:00",
                    end_time: "00:00",
                  },
                ],
              },
            },
          }}
          onExecute={(body) =>
            executeWithBaseUrl(
              "POST",
              `/api/uber/stores/${storeId}/holiday-hours`,
              body,
            )
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.store</code> scope.
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-2">Request Body Structure:</p>
              <div className="space-y-3">
                <div>
                  <p className="font-bold border-b border-primary/20 pb-1 mb-1">
                    holiday_hours
                  </p>
                  <p className="opacity-80">
                    Map of holiday dates, each with optional open_time_periods.
                  </p>
                </div>
                <div>
                  <p className="font-bold border-b border-primary/20 pb-1 mb-1">
                    open_time_periods
                  </p>
                  <p className="opacity-80">
                    Contains 1 or more periods. For a closed day, set start/end
                    to 00:00.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </EndpointPanel>
      </div>
    </div>
  );
};
