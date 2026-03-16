import React, { useState } from "react";
import { Play, Copy, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "./Sidebar";

interface EndpointPanelProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  title: string;
  description?: string;
  defaultBody?: any;
  displayEndpoint?: string;
  children?: React.ReactNode;
  onExecute: (
    body: any,
  ) => Promise<{ data: any; meta: { status: number; latency: number } }>;
}

export const EndpointPanel: React.FC<EndpointPanelProps> = ({
  method,
  endpoint,
  title,
  description,
  defaultBody,
  displayEndpoint,
  children,
  onExecute,
}) => {
  const [body, setBody] = useState<string>(
    defaultBody ? JSON.stringify(defaultBody, null, 2) : "",
  );
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getMethodColor = (m: string) => {
    switch (m) {
      case "GET":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "POST":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "PUT":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "DELETE":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    try {
      let parsedBody = undefined;
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          setResponse({
            error: "Invalid JSON in Request Body",
            meta: { status: 0, latency: 0 },
          });
          setLoading(false);
          return;
        }
      }
      const res = await onExecute(parsedBody);
      setResponse(res);
    } catch (err: any) {
      setResponse({
        error: err.response?.data || err.message,
        meta: { status: err.response?.status || 500, latency: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(
        JSON.stringify(response.data || response.error, null, 2),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuccess =
    response?.meta?.status >= 200 && response?.meta?.status < 300;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surfaceHover/50">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-textMuted mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 bg-surface border border-border px-3 py-1.5 rounded-lg">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-bold border",
              getMethodColor(method),
            )}
          >
            {method}
          </span>
          <code className="text-sm font-mono text-textMain">
            {displayEndpoint || endpoint}
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left Side: Request */}
        <div className="p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-textMuted uppercase tracking-wider">
              Request
            </h3>
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primaryHover disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            {children && <div className="space-y-4">{children}</div>}

            {method !== "GET" ? (
              <div className="flex-1 flex flex-col">
                <label className="text-xs text-textMuted mb-2">
                  Body (JSON)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex-1 w-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none min-h-[200px]"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-textMuted text-sm bg-surfaceHover/30 rounded-lg border border-border border-dashed min-h-[200px]">
                No body required for GET request
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Response */}
        <div className="p-4 flex flex-col bg-[#1e1e1e]/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-textMuted uppercase tracking-wider">
              Response
            </h3>
            {response && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={cn(
                      "font-medium flex items-center gap-1",
                      isSuccess ? "text-success" : "text-danger",
                    )}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {response.meta.status}
                  </span>
                  <span className="text-textMuted">
                    {response.meta.latency}ms
                  </span>
                </div>
                <button
                  onClick={copyResponse}
                  className="text-textMuted hover:text-white transition-colors"
                  title="Copy JSON"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-border overflow-hidden relative min-h-[200px]">
            {!response && !loading && (
              <div className="absolute inset-0 flex items-center justify-center text-textMuted text-sm">
                Hit Send to see response
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-primary text-sm animate-pulse">
                Awaiting response...
              </div>
            )}
            {response && (
              <pre className="p-4 text-sm font-mono text-gray-300 overflow-auto h-full absolute inset-0">
                {JSON.stringify(response.data || response.error, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
