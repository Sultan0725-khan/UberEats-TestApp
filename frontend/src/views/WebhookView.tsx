import React, { useEffect, useState } from "react";
import { Eye, RefreshCw, ShoppingCart, Trash2, Webhook, Clock } from "lucide-react";
import api from "../lib/api";
import { cn } from "../components/Sidebar";

export const WebhookView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [orderDetails, setOrderDetails] = useState<Record<string, any>>({});
  const [fetchingOrder, setFetchingOrder] = useState<Record<string, boolean>>({});
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/webhooks/events");
      setEvents(res.data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string, eventId: string) => {
    setFetchingOrder((prev) => ({ ...prev, [eventId]: true }));
    setOrderErrors((prev) => ({ ...prev, [eventId]: "" }));
    try {
      const res = await api.get(`/api/uber/orders/${orderId}`);
      if (!res.data || !res.data.data) {
          throw new Error("Invalid response from proxy");
      }
      setOrderDetails((prev) => ({ ...prev, [eventId]: res.data.data }));
    } catch (e: any) {
      console.error("Failed to fetch order details:", e);
      setOrderErrors((prev) => ({ ...prev, [eventId]: e.response?.data?.error?.message || e.response?.data?.error || e.message || "Unknown error" }));
    } finally {
      setFetchingOrder((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const clearEvents = async () => {
    try {
      await api.delete("/api/webhooks/events");
      setEvents([]);
      setOrderDetails({});
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Webhook className="text-primary w-6 h-6" />
            Webhook Timeline
          </h1>
          <p className="text-textMuted mt-1">
            Live feed of incoming Uber Eats Webhooks.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-textMuted cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-surface border-border text-primary focus:ring-primary"
            />
            Auto-refresh (3s)
          </label>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 ml-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-textMuted hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button
            onClick={clearEvents}
            className="flex items-center gap-2 px-3 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center text-textMuted flex flex-col items-center">
            <Webhook className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-white mb-2">
              No webhooks received yet
            </p>
            <p className="text-sm">
              Configure Webhook URL in Uber Dashboard to point to your
              ngrok tunnel's{" "}
              <code className="bg-surfaceHover px-2 py-1 rounded">
                /webhooks
              </code>{" "}
              path
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((evt, idx) => {
              const date = new Date(evt._received_at || evt.event_time);
              const isOrder = evt.event_type === "orders.notification";
              const orderId = evt.meta?.resource_id || evt.resource_href?.split("/").pop();
              const details = orderDetails[evt.event_id];
              const isFetching = fetchingOrder[evt.event_id];

              return (
                <div
                  key={evt.event_id || idx}
                  className="p-4 hover:bg-surfaceHover/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-bold border",
                          isOrder
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-surfaceHover text-textMuted border-border",
                        )}
                      >
                        {evt.event_type}
                      </span>
                      <span className="text-xs text-textMuted font-mono bg-[#1e1e1e] px-2 py-1 rounded border border-border">
                        ID: {evt.event_id}
                      </span>
                    </div>
                    <span className="text-xs text-textMuted flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {date.toLocaleTimeString()} - {date.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-3">
                      <pre className="text-[10px] font-mono text-gray-400 bg-[#161616] p-3 rounded border border-border overflow-x-auto max-h-48">
                        {JSON.stringify(evt.meta || evt, null, 2)}
                      </pre>
                      
                      {isOrder && orderId && !details && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => fetchOrderDetails(orderId, evt.event_id)}
                            disabled={isFetching}
                            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 w-fit"
                          >
                            {isFetching ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                            Get Order Details ({orderId.slice(0, 8)}...)
                          </button>
                          {orderErrors[evt.event_id] && (
                            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 p-2 rounded-md">
                              Error: {typeof orderErrors[evt.event_id] === "string" ? orderErrors[evt.event_id] : JSON.stringify(orderErrors[evt.event_id])}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {details && (
                      <div className="bg-surfaceHover/30 border border-primary/20 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-primary" />
                            {details.store?.name || "Order Details"}
                          </h4>
                          <span className="text-[10px] text-textMuted bg-surface px-1.5 py-0.5 rounded border border-border">
                            {details.display_id}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-wider text-textMuted font-bold">Items</p>
                          <div className="space-y-1.5">
                            {details.cart?.items?.map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300">
                                  {item.quantity}x {item.title || item.name}
                                </span>
                                <span className="text-white font-medium">
                                  {item.price?.total_price?.formatted_amount || item.price?.formatted_amount || "N/A"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                          <span className="text-textMuted">Placed At:</span>
                          <span className="text-white font-mono">
                            {new Date(details.placed_at || details.placed_at_utc).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
