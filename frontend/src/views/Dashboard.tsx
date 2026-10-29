import React, { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Server,
  KeyRound,
  Store,
  ShoppingBag,
  Radio,
} from "lucide-react";
import api from "../lib/api";
import { cn } from "../components/Sidebar";

export const Dashboard = () => {
  const [health, setHealth] = useState<any>(null);
  const [backendUnreachable, setBackendUnreachable] = useState(false);

  useEffect(() => {
    api
      .get("/health")
      .then((res) => {
        setHealth(res.data);
        setBackendUnreachable(false);
      })
      .catch((err) => {
        if (!err.response) {
          setBackendUnreachable(true);
        }
        setHealth({ status: "error" });
      });
  }, []);

  const isOnline = health?.status === "ok";

  const stats = [
    {
      label: "Backend Status",
      value: backendUnreachable ? "Unreachable" : isOnline ? "Online" : "Offline",
      icon: Activity,
      color: backendUnreachable
        ? "text-warning"
        : isOnline
          ? "text-success"
          : "text-danger",
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

  const steps = [
    {
      icon: Server,
      title: "Start the Backend",
      description: (
        <>
          Run{" "}
          <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white text-xs">
            cd backend && npm run dev
          </code>{" "}
          to start the local Express proxy server on port 3000. All API calls
          are routed through it.
        </>
      ),
    },
    {
      icon: KeyRound,
      title: "Generate an Access Token",
      description: (
        <>
          Go to the <strong className="text-white">Authentication</strong> tab,
          select the scopes you need, and hit{" "}
          <strong className="text-white">Send Request</strong>. The token is
          stored automatically and used for all subsequent calls.
        </>
      ),
    },
    {
      icon: Store,
      title: "Verify Your Store",
      description: (
        <>
          Open <strong className="text-white">Stores API</strong>, confirm your
          Store ID is correct, and run{" "}
          <strong className="text-white">Get Store Details</strong> to make sure
          your store is accessible in the sandbox.
        </>
      ),
    },
    {
      icon: ShoppingBag,
      title: "Test Order Flows",
      description: (
        <>
          Use the <strong className="text-white">Orders API</strong> to fetch
          active orders and simulate accepting, denying, or cancelling them.
          Trigger test orders from the Uber Eats app or Postman.
        </>
      ),
    },
    {
      icon: Radio,
      title: "Monitor Webhooks Live",
      description: (
        <>
          Point your webhook URL in the Uber Developer Dashboard to your{" "}
          <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white text-xs">
            ngrok
          </code>{" "}
          or{" "}
          <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white text-xs">
            Cloudflare Tunnel
          </code>{" "}
          address followed by{" "}
          <code className="bg-surfaceHover px-1.5 py-0.5 rounded text-white text-xs">
            /webhooks
          </code>
          . Events appear here in real time.
        </>
      ),
    },
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

      {/* Backend unreachable warning */}
      {backendUnreachable && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-warning font-semibold text-sm">
              Backend server not reachable
            </p>
            <p className="text-warning/80 text-xs mt-1 leading-relaxed">
              The app can't connect to the Express backend. If you're running
              locally, make sure the backend is started with{" "}
              <code className="bg-warning/10 px-1 rounded">
                cd backend && npm run dev
              </code>
              . If you deployed this on Vercel, set the{" "}
              <code className="bg-warning/10 px-1 rounded">VITE_API_URL</code>{" "}
              environment variable to your deployed backend URL.
            </p>
          </div>
        </div>
      )}

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

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-5">
          How to get started
        </h2>
        <ol className="space-y-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-sm text-textMuted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
