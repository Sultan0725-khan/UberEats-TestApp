import React from "react";
import {
  LayoutDashboard,
  Key,
  Store,
  MenuSquare,
  ShoppingBag,
  Radio,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type View = "dashboard" | "auth" | "stores" | "menus" | "orders" | "webhooks";

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
}) => {
  const handleNav = (view: View) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <div
      className={cn(
        "w-64 bg-surface border-r border-border h-screen flex flex-col",
        "fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0 md:z-auto md:transition-none md:flex-shrink-0",
      )}
    >
      <div className="p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
              U
            </span>
            Uber ATS
          </h1>
          <p className="text-xs text-textMuted mt-1">Sandbox Integration App</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-textMuted hover:text-textMain hover:bg-surfaceHover transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-textMuted hover:bg-surfaceHover hover:text-textMain",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
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
            <span className="w-2 h-2 rounded-full bg-success flex-shrink-0"></span>
            <span className="text-white">API Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
