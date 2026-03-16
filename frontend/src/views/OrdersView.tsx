import React, { useState } from "react";
import { EndpointPanel } from "../components/EndpointPanel";
import api from "../lib/api";

export const OrdersView = () => {
  const [storeId, setStoreId] = useState(
    "e269b9b3-e859-47b5-a9da-d82ce41139be",
  );
  const [orderId, setOrderId] = useState("5d816729-534e-4e..."); // Placeholder

  const [defaultPickupTime] = useState(
    () => Math.floor(Date.now() / 1000) + 1800,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Orders API
          </h1>
          <p className="text-textMuted mt-1">
            Manage active orders, accept, deny, or cancel them.
          </p>
        </div>

        <div className="flex flex-col gap-2 bg-surface p-3 rounded-xl border border-border">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-textMuted font-medium uppercase tracking-wider w-20">
              Store ID
            </label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="bg-[#1e1e1e] border border-border text-white text-sm rounded px-3 py-1.5 w-72 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-textMuted font-medium uppercase tracking-wider w-20">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-[#1e1e1e] border border-border text-white text-sm rounded px-3 py-1.5 w-72 focus:outline-none focus:border-primary font-mono text-primary"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <EndpointPanel
          title="Get Active Created Orders"
          description="Fetch all active orders that have just been created for the store."
          method="GET"
          displayEndpoint="{{base_url}}/v1/eats/stores/${storeId}/created-orders"
          endpoint={`/api/uber/stores/${storeId}/created-orders`}
          onExecute={() =>
            api
              .get(`/api/uber/stores/${storeId}/created-orders`)
              .then((res) => res.data)
          }
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with the{" "}
            <code className="text-secondary">eats.order</code> scope.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Order Details"
          description="Fetch full details for a specific order by ID."
          method="GET"
          displayEndpoint="{{base_url}}/v2/eats/order/${orderId}"
          endpoint={`/api/uber/orders/${orderId}`}
          onExecute={() =>
            api.get(`/api/uber/orders/${orderId}`).then((res) => res.data)
          }
        >
          <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
            <span className="text-primary font-semibold">Scope:</span> OAuth 2.0
            Bearer token with the{" "}
            <code className="text-secondary">eats.order</code> scope.
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Accept Order"
          description="Acknowledge receipt of a new order from a store's POS."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/order/${orderId}/accept_pos_order"
          endpoint={`/api/uber/orders/${orderId}/accept_pos_order`}
          defaultBody={{
            reason: "Accepted in Sandbox UI",
            pickup_time: defaultPickupTime,
          }}
          onExecute={(body) =>
            api
              .post(`/api/uber/orders/${orderId}/accept_pos_order`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.order</code> scope.
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-1">Request Body Parameters:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>
                  <strong>reason:</strong> (Optional) String explaining the
                  acceptance.
                </li>
                <li>
                  <strong>pickup_time:</strong> (Optional) Expected pickup time
                  in seconds since epoch.
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Deny Order"
          description="Deny a newly created pos order if it cannot be fulfilled."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/order/${orderId}/deny_pos_order"
          endpoint={`/api/uber/orders/${orderId}/deny`}
          defaultBody={{ explanation: "Item out of stock" }}
          onExecute={(body) =>
            api
              .post(`/api/uber/orders/${orderId}/deny`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.order</code> scope.
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-1">Request Body Parameters:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>
                  <strong>explanation:</strong> (Required) Reason for denying
                  the order.
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Cancel Order"
          description="Cancel an already accepted order."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/order/${orderId}/cancel"
          endpoint={`/api/uber/orders/${orderId}/cancel`}
          defaultBody={{ reason: "Order delayed" }}
          onExecute={(body) =>
            api
              .post(`/api/uber/orders/${orderId}/cancel`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.order</code> scope.
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-1">Request Body Parameters:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>
                  <strong>reason:</strong> (Required) Detailed reason for
                  cancellation.
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Order Ready"
          description="Set the order as ready for pickup. Also known as Update Delivery Status."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/orders/${orderId}/restaurant_delivery_status"
          endpoint={`/api/uber/orders/${orderId}/ready`}
          defaultBody={{ status: "READY_FOR_PICKUP" }}
          onExecute={(body) =>
            api
              .post(`/api/uber/orders/${orderId}/ready`, body)
              .then((res) => res.data)
          }
        >
          <div className="space-y-4">
            <div className="bg-surfaceHover/50 border border-border rounded-lg p-3 text-xs">
              <span className="text-primary font-semibold">Scope:</span> OAuth
              2.0 Bearer token with the{" "}
              <code className="text-secondary">eats.store</code> or{" "}
              <code className="text-secondary">eats.order</code> scope.
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-blue-200">
              <p className="font-semibold mb-1">Request Body Parameters:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>
                  <strong>status:</strong> (Required) Use{" "}
                  <code className="text-white">READY_FOR_PICKUP</code> to notify
                  courier.
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>
      </div>
    </div>
  );
};
