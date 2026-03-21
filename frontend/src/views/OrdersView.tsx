import React, { useState } from "react";
import { RefreshCw, MapPin, Clock, ArrowRight } from "lucide-react";
import { EndpointPanel } from "../components/EndpointPanel";
import api from "../lib/api";
import type { UberOrder } from "../types/uber";
import { cn } from "../components/Sidebar";

export const OrdersView = () => {
  const [storeId, setStoreId] = useState(
    "e269b9b3-e859-47b5-a9da-d82ce41139be",
  );
  const [orderId, setOrderId] = useState("");
  const [fetchedOrders, setFetchedOrders] = useState<UberOrder[]>([]);

  const [defaultPickupTime] = useState(
    () => Math.floor(Date.now() / 1000) + 1800,
  );

  const [defaultReadyTime] = useState(() =>
    new Date(Date.now() + 1800000).toISOString(),
  );

  const handleCreatedOrdersResponse = (res: any) => {
    if (res.data && res.data.orders) {
      setFetchedOrders(res.data.orders);
    }
    return res;
  };

  const handleQuickAction = (id: string, targetY: number) => {
    setOrderId(id);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

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

      {/* Orders Dashboard */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Recently Fetched Orders
          </h2>
          <span className="text-xs text-textMuted bg-surfaceHover px-2 py-1 rounded border border-border capitalize">
            {fetchedOrders.length}{" "}
            {fetchedOrders.length === 1 ? "Order" : "Orders"} Found
          </span>
        </div>

        {fetchedOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg bg-[#1e1e1e]/30">
            <p className="text-textMuted text-sm">
              No orders fetched yet. Execute "Get Active Created Orders" below
              to populate this list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fetchedOrders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  "p-4 rounded-xl border border-border bg-[#1e1e1e] hover:border-primary transition-all group",
                  orderId === order.id && "ring-1 ring-primary border-primary",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">
                      Order ID
                    </span>
                    <span className="text-sm font-mono text-primary truncate max-w-[140px]">
                      {order.id}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                      order.current_state === "CREATED"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    {order.current_state}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-textMuted">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.placed_at).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleQuickAction(order.id, 650)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-surfaceHover hover:bg-primary/10 hover:text-primary rounded text-[10px] font-medium transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleQuickAction(order.id, 900)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-surfaceHover hover:bg-green-500/10 hover:text-green-400 rounded text-[10px] font-medium transition-colors"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
              .then(handleCreatedOrdersResponse)
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
          displayEndpoint="{{base_url}}/v1/eats/orders/${orderId}/accept_pos_order"
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
          title="Order Ready"
          description="Set the order as ready for pickup. Also known as Update Delivery Status."
          method="POST"
          displayEndpoint="{{base_url}}/v1/delivery/order/${orderId}/ready"
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

        <EndpointPanel
          title="Update Ready Time"
          description="Update the ready time for the order."
          method="POST"
          displayEndpoint="{{base_url}}/v1/delivery/order/${orderId}/update-ready-time"
          endpoint={`/api/uber/orders/${orderId}/update-ready-time`}
          defaultBody={{ ready_for_pickup_time: defaultReadyTime }}
          onExecute={(body) =>
            api
              .post(`/api/uber/orders/${orderId}/update-ready-time`, body)
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
                  <strong>ready_for_pickup_time:</strong> (Required) The
                  expected time when the order will be ready, in ISO-8601 string
                  format.
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Cancel Order"
          description="Cancel an already accepted order."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/orders/${orderId}/cancel"
          endpoint={`/api/uber/orders/${orderId}/cancel`}
          defaultBody={{ reason: "KITCHEN_CLOSED" }}
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
                  cancellation. Valid values: <br />
                  <code className="text-secondary text-[10px]">
                    OUT_OF_ITEMS, KITCHEN_CLOSED, CUSTOMER_CALLED_TO_CANCEL,
                    RESTAURANT_TOO_BUSY, CANNOT_COMPLETE_CUSTOMER_NOTE, OTHER
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </EndpointPanel>

        <EndpointPanel
          title="Deny Order"
          description="Deny a newly created pos order if it cannot be fulfilled."
          method="POST"
          displayEndpoint="{{base_url}}/v1/eats/orders/${orderId}/deny_pos_order"
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
      </div>
    </div>
  );
};
