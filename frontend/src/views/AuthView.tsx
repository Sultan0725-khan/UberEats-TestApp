import React, { useState, useEffect } from "react";
import { EndpointPanel } from "../components/EndpointPanel";
import api from "../lib/api";

const AVAILABLE_SCOPES = [
  { id: "eats.order", label: "See Order Details" },
  { id: "eats.store", label: "See Store Details" },
  { id: "eats.store.orders.read", label: "See New Order" },
  { id: "eats.report", label: "eats.report" },
  {
    id: "eats.store.orders.restaurantdelivery.status",
    label: "Delivery Status",
  },
  { id: "eats.store.status.write", label: "Write Store Status" },
  { id: "eats.store.orders.cancel", label: "Cancel Orders" },
  { id: "eats.pos_provisioning", label: "POS Provisioning" },
];

const DEFAULT_SCOPES = [
  "eats.order",
  "eats.store",
  "eats.store.orders.read",
  "eats.store.status.write",
];

export const AuthView = () => {
  const [selectedScopes, setSelectedScopes] =
    useState<string[]>(DEFAULT_SCOPES);

  const toggleScope = (id: string) => {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const currentScopeString = selectedScopes.join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Authentication
        </h1>
        <p className="text-textMuted mt-1">
          Generate Developer OAuth tokens for the Uber API.
        </p>
      </div>

      <EndpointPanel
        title="Developer Token Endpoint"
        description="Fetch a new client_credentials token from UberEats. The Token is saved automatically for further calls."
        method="POST"
        displayEndpoint="https://sandbox-login.uber.com/oauth/v2/token"
        endpoint="/api/uber/auth/token"
        defaultBody={{ scope: currentScopeString }}
        onExecute={(body) =>
          api.post("/api/uber/auth/token", body).then((res) => res.data)
        }
      >
        <div className="bg-surfaceHover/50 border border-border rounded-lg p-4">
          <label className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3 block">
            Select Scopes
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AVAILABLE_SCOPES.map((scope) => (
              <label
                key={scope.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-surface transition-colors cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedScopes.includes(scope.id)}
                  onChange={() => toggleScope(scope.id)}
                  className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-surface"
                />
                <span className="text-sm text-textMain group-hover:text-white transition-colors">
                  {scope.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-textMuted font-mono break-all">
              <span className="text-primary">scope:</span> "{currentScopeString}
              "
            </p>
          </div>
        </div>
      </EndpointPanel>
    </div>
  );
};
