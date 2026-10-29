import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { AuthView } from "./views/AuthView";
import { StoresView } from "./views/StoresView";
import { MenusView } from "./views/MenusView";
import { OrdersView } from "./views/OrdersView";
import { WebhookView } from "./views/WebhookView";

export type View =
  | "dashboard"
  | "auth"
  | "stores"
  | "menus"
  | "orders"
  | "webhooks";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "auth":
        return <AuthView />;
      case "stores":
        return <StoresView />;
      case "menus":
        return <MenusView />;
      case "orders":
        return <OrdersView />;
      case "webhooks":
        return <WebhookView />;
      default:
        return <Dashboard />;
    }
  };

  const viewTitles: Record<View, string> = {
    dashboard: "Dashboard",
    auth: "Authentication",
    stores: "Stores API",
    menus: "Menus API",
    orders: "Orders API",
    webhooks: "Webhook Timeline",
  };

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-white">
            {viewTitles[currentView]}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            <span className="text-xs text-textMuted">Connected</span>
          </div>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
