"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package, Ship, Warehouse,
  ChevronLeft, LogOut, BarChart3, MessageSquare,
  Newspaper, ClipboardList, DollarSign, TrendingUp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, initials } from "@/lib/utils";
import type { UserRole, AdminRole } from "@/lib/auth/types";

interface AdminSidebarProps {
  user: { name: string | null; email: string; role: UserRole; adminRole?: AdminRole | null };
}

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  allowedRoles: AdminRole[];
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    allowedRoles: ["system_admin", "warehouse_manager"],
  },
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
    allowedRoles: ["system_admin"],
  },
  {
    href: "/admin/commodities",
    icon: Package,
    label: "Commodities",
    allowedRoles: ["content_manager"],
  },
  {
    href: "/admin/warehouse",
    icon: Warehouse,
    label: "Warehouse",
    allowedRoles: ["warehouse_manager"],
    children: [
      { href: "/admin/warehouse/receipts", label: "Receipts" },
      { href: "/admin/warehouse/stock",    label: "Stock Overview" },
    ],
  },
  {
    href: "/admin/demands",
    icon: ClipboardList,
    label: "Demands & RFQs",
    allowedRoles: ["warehouse_manager"],
    children: [
      { href: "/admin/demands?type=all", label: "Demands" },
      { href: "/admin/demands?type=rfq", label: "Quotes" },
    ],
  },
  {
    href: "/admin/shipments",
    icon: Ship,
    label: "Shipments",
    allowedRoles: ["warehouse_manager"],
  },
  {
    href: "/admin/finance",
    icon: DollarSign,
    label: "Finance & Settlement",
    allowedRoles: ["finance_manager"],
  },
  {
    href: "/admin/commodity-prices",
    icon: TrendingUp,
    label: "Commodity Prices",
    allowedRoles: ["content_manager"],
  },
  {
    href: "/admin/contacts",
    icon: MessageSquare,
    label: "Contact Inbox",
    allowedRoles: ["content_manager"],
  },
  {
    href: "/admin/news",
    icon: Newspaper,
    label: "News & Events",
    allowedRoles: ["content_manager"],
  },
  {
    href: "/admin/reports",
    icon: BarChart3,
    label: "Reports & Analytics",
    allowedRoles: ["system_admin", "warehouse_manager", "finance_manager"],
  },
];

const ACCENT = "#7c3aed";

const ROLE_LABELS: Record<AdminRole, string> = {
  system_admin:      "System Admin",
  warehouse_manager: "Warehouse Manager",
  content_manager:   "Content Manager",
  finance_manager:   "Finance Manager",
};

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Filter nav to only items this adminRole can see.
  // If no adminRole set (legacy admin), show everything.
  const visibleNav = user.adminRole
    ? navItems.filter((item) => item.allowedRoles.includes(user.adminRole!))
    : navItems;

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
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-neutral-900 truncate">Azuretti</p>
              <p className="text-[10px] text-neutral-400 truncate">
                {user.adminRole ? ROLE_LABELS[user.adminRole] : "Admin Portal"}
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {visibleNav.map((item) => {
          const Icon   = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const hasChildren = "children" in item && item.children;

          return (
            <div key={item.href}>
              <Link
                href={hasChildren ? item.children![0].href : item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150",
                  active ? "text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  collapsed && "justify-center px-2"
                )}
                style={active ? { background: ACCENT } : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>

              {!collapsed && hasChildren && active && (
                <div className="ml-4 mb-1 space-y-0.5 border-l border-border pl-3">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-2 py-1.5 rounded text-xs font-medium transition-colors",
                          childActive ? "text-white" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                        )}
                        style={childActive ? { background: ACCENT } : undefined}
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: ACCENT }}>
              {initials(user.name ?? user.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{user.name ?? "Admin"}</p>
              <p className="text-xs text-neutral-400 truncate">
                {user.adminRole ? ROLE_LABELS[user.adminRole] : user.email}
              </p>
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: ACCENT }}>
              {initials(user.name ?? user.email)}
            </div>
            <button onClick={() => setCollapsed(false)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}