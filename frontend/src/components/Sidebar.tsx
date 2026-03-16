import React from "react";
import {
  LayoutDashboard,
  Key,
  Store,
  MenuSquare,
  ShoppingBag,
  Radio,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type View = "dashboard" | "auth" | "stores" | "menus" | "orders" | "webhooks";

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "auth", label: "Authentication", icon: Key },
  { id: "stores", label: "Stores API", icon: Store },
  { id: "menus", label: "Menus API", icon: MenuSquare },
  { id: "orders", label: "Orders API", icon: ShoppingBag },
  { id: "webhooks", label: "Webhook Timeline", icon: Radio },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
}) => {
  return (
    <div className="w-64 bg-surface border-r border-border h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            U
          </span>
          Uber ATS
        </h1>
        <p className="text-xs text-textMuted mt-1">Sandbox Integration App</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-textMuted hover:bg-surfaceHover hover:text-textMain",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-textMuted",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-surfaceHover rounded-lg p-3 text-xs text-textMuted border border-border">
          <p>Local Sandbox Env</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="text-white">API Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
