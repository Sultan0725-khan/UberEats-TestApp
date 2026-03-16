import React, { useState } from "react";
import { EndpointPanel } from "../components/EndpointPanel";
import api from "../lib/api";

export const MenusView = () => {
  const [storeId, setStoreId] = useState(
    "e269b9b3-e859-47b5-a9da-d82ce41139be",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Menus API
          </h1>
          <p className="text-textMuted mt-1">
            Retrieve and manage store menus.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border">
          <label className="text-xs text-textMuted font-medium uppercase tracking-wider ml-1">
            Store ID
          </label>
          <input
            type="text"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="bg-[#1e1e1e] border border-border text-white text-sm rounded px-3 py-1.5 w-72 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-8">
        <EndpointPanel
          title="Get Menu"
          description="Fetch the active menu for a specific store."
          method="GET"
          endpoint={`/api/uber/stores/${storeId}/menus`}
          onExecute={() =>
            api.get(`/api/uber/stores/${storeId}/menus`).then((res) => res.data)
          }
        />

        <EndpointPanel
          title="Upload Menu"
          description="Upload a new menu configuration for the store."
          method="POST"
          endpoint={`/api/uber/stores/${storeId}/menus`}
          defaultBody={{
            items: [
              {
                id: "item-1",
                title: { translations: { en_us: "Test Burger" } },
                price_info: { price: 1000 },
              },
            ],
          }}
          onExecute={(body) =>
            api
              .post(`/api/uber/stores/${storeId}/menus`, body)
              .then((res) => res.data)
          }
        />

        <EndpointPanel
          title="Update Menu Item"
          description="Update a specific menu item."
          method="POST"
          endpoint={`/api/uber/stores/${storeId}/menus/items/{item_id}`}
          defaultBody={{
            price_info: { price: 1200, overrides: [] },
            suspend_until: 0,
          }}
          // Note: using a hardcoded 'item-1' for demonstration, user can edit if needed
          onExecute={(body) =>
            api
              .post(`/api/uber/stores/${storeId}/menus/items/item-1`, body)
              .then((res) => res.data)
          }
        />
      </div>
    </div>
  );
};
