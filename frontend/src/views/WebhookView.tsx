import React, { useEffect, useState } from "react";
import { RefreshCw, Trash2, Webhook } from "lucide-react";
import api from "../lib/api";
import { cn } from "../components/Sidebar";

export const WebhookView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const clearEvents = async () => {
    try {
      await api.delete("/api/webhooks/events");
      setEvents([]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
    let interval: NodeJS.Timeout;
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
              Configure ngrok to point to{" "}
              <code className="bg-surfaceHover px-2 py-1 rounded">
                http://localhost:3000/webhooks/uber-eats
              </code>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((evt, idx) => {
              const date = new Date(evt._received_at);
              const isOrder = evt.event_type === "orders.notification";
              return (
                <div
                  key={idx}
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
                    <span className="text-xs text-textMuted">
                      {date.toLocaleTimeString()} - {date.toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="mt-2 text-xs font-mono text-gray-300 bg-[#1e1e1e] p-4 rounded border border-border overflow-x-auto">
                    {JSON.stringify(evt.meta || evt, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
