import React, { useEffect, useState } from "react";
import { Activity, Clock, ShieldCheck, Zap } from "lucide-react";
import api from "../lib/api";
import { cn } from "../components/Sidebar";

export const Dashboard = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "error" }));
  }, []);

  const stats = [
    {
      label: "Backend Status",
      value: health?.status === "ok" ? "Online" : "Offline",
      icon: Activity,
      color: health?.status === "ok" ? "text-success" : "text-danger",
    },
    {
      label: "Token Status",
      value: "Check Auth Tab",
      icon: ShieldCheck,
      color: "text-primary",
    },
    {
      label: "Latest Webhook",
      value: "Polling...",
      icon: Zap,
      color: "text-warning",
    },
    { label: "Last Order", value: "None", icon: Clock, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-textMuted mt-1">
          Overview of your Uber Eats Sandbox environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-surface border border-border p-5 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={cn("w-5 h-5", stat.color)} />
                <h3 className="text-sm font-medium text-textMuted">
                  {stat.label}
                </h3>
              </div>
              <p className="text-xl font-bold text-white mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Getting Started
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-textMuted text-sm">
          <li>
            Go to the <strong className="text-white">Authentication</strong> tab
            and generate a Sandbox Token.
          </li>
          <li>
            Ensure your Store ID is configured in the{" "}
            <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white">
              .env
            </code>{" "}
            file.
          </li>
          <li>
            Use the <strong className="text-white">Stores API</strong> to verify
            your store is accessible.
          </li>
          <li>
            Use the <strong className="text-white">Orders API</strong> to fetch
            active orders or simulate them via Postman or the Uber App.
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3">•</span>
            Set up <strong className="text-white">Cloudflare</strong> to forward
            webhooks to your tunnel's{" "}
            <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white">
              /webhooks
            </code>{" "}
            path and view them live.
          </li>
        </ol>
      </div>
    </div>
  );
};
