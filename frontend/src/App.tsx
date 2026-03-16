import React, { useState } from "react";
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

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-8">{renderView()}</div>
      </main>
    </div>
  );
}

export default App;
