"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Ship, FileText, Warehouse, Search,
  Bell, Settings, ChevronLeft,
  BarChart3, Users, LogOut,
  DollarSign, ClipboardList,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, initials } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/types";
import { theme } from "@/config/theme";

interface PortalSidebarProps {
  user: { name: string | null; email: string; role: UserRole };
}

// ── Nav items by role ──────────────────────────────────────────────────────
function getNavItems(role: UserRole) {
  if (role === "exporter" || role === "farmer") {
    return [
      { href: "/portal/exporter/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
      { href: "/portal/exporter/warehouse",    icon: Warehouse,       label: "My Warehouse" },
      { href: "/portal/exporter/sales",        icon: DollarSign,      label: "My Sales & Payments" },
      { href: "/portal/exporter/reports",    icon: BarChart3,        label: "Reports & Audit" },
      /* { href: "/portal/exporter/shipments",    icon: Ship,            label: "My Shipments" },
      { href: "/portal/exporter/offers",       icon: Package,         label: "Supply Offers" },
      { href: "/portal/exporter/documents",    icon: FileText,        label: "Documents" },
      { href: "/portal/exporter/notifications",icon: Bell,            label: "Notifications" },
      { href: "/portal/exporter/settings",     icon: Settings,        label: "Settings" }, */
    ];
  }

  if (role === "buyer") {
    return [
      { href: "/portal/buyer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
      { href: "/portal/buyer/search",       icon: Search,          label: "Search Commodities" },
      {
        href:     "/portal/buyer/demands",
        icon:     ClipboardList,
        label:    "My Demands",
        children: [
          { href: "/portal/buyer/demands",     label: "Demands" },
          { href: "/portal/buyer/rfq",         label: "Quote Requests" },
        ],
      },
      { href: "/portal/buyer/shipments",    icon: Ship,            label: "Shipments" },
      { href: "/portal/buyer/reports",    icon: BarChart3,        label: "Reports & Audit" },
      /* { href: "/portal/buyer/notifications",icon: Bell,            label: "Notifications" },
      { href: "/portal/buyer/settings",     icon: Settings,        label: "Settings" }, */
    ];
  }

  // admin
  return [
    { href: "/admin/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/users",       icon: Users,           label: "Users" },
    { href: "/admin/shipments",   icon: Ship,            label: "Shipments" },
    { href: "/admin/commodities", icon: Package,         label: "Commodities" },
    { href: "/admin/analytics",   icon: BarChart3,       label: "Analytics" },
    { href: "/admin/settings",    icon: Settings,        label: "Settings" },
  ];
}

const roleLabel: Record<UserRole, string> = {
  exporter:   "Exporter Portal",
  buyer:      "Buyer Portal",
  farmer:     "Supplier Portal",
  admin:      "Admin Portal",
};

const roleAccent: Record<UserRole, string> = {
  exporter:   theme.portals.exporter.accent,
  buyer:      theme.portals.buyer.accent,
  farmer:     theme.portals.exporter.accent,
  admin:      theme.portals.admin.accent,
};

// ── Component ──────────────────────────────────────────────────────────────
export function PortalSidebar({ user }: PortalSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems  = getNavItems(user.role);
  const accent    = roleAccent[user.role];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full border-r border-border bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: accent }}
            >
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-neutral-900 truncate">Azuretti</p>
              <p className="text-[10px] text-neutral-400 truncate">{roleLabel[user.role]}</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent }}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => {
          const Icon       = item.icon;
          const hasChildren = "children" in item && item.children;
          const active      = pathname === item.href || pathname.startsWith(`${item.href}/`);
          // For items with children, active if any child path matches
          const childActive = hasChildren
            ? item.children!.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))
            : false;
          const isActive = active || childActive;

          return (
            <div key={item.href}>
              <Link
                href={hasChildren ? item.children![0].href : item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150",
                  isActive
                    ? "text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  collapsed && "justify-center px-2"
                )}
                style={isActive ? { background: accent } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>

              {/* Sub-items — visible when parent is active and sidebar is expanded */}
              {!collapsed && hasChildren && isActive && (
                <div className="ml-4 mb-1 space-y-0.5 border-l border-border pl-3">
                  {item.children!.map((child) => {
                    const childIsActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-2 py-1.5 rounded text-xs font-medium transition-colors",
                          childIsActive
                            ? "text-white"
                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                        )}
                        style={childIsActive ? { background: accent } : undefined}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: accent }}
            >
              {initials(user.name ?? user.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{user.name ?? "User"}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: accent }}
            >
              {initials(user.name ?? user.email)}
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
