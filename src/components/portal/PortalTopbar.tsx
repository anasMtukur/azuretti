"use client";

import { Bell, Search, Menu } from "lucide-react";
import { initials } from "@/lib/utils";
import { theme } from "@/config/theme";
import type { UserRole } from "@/lib/auth/types";

interface PortalTopbarProps {
  user: { name: string | null; email: string; role: UserRole };
}

const roleAccent: Record<UserRole, string> = {
  exporter: theme.portals.exporter.accent,
  buyer:    theme.portals.buyer.accent,
  farmer:   theme.portals.exporter.accent,
  admin:    theme.portals.admin.accent,
};

export function PortalTopbar({ user }: PortalTopbarProps) {
  const accent = roleAccent[user.role];

  return (
    <header className="h-14 border-b border-border bg-white flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu trigger (placeholder — mobile nav to be built) */}
      <button
        className="lg:hidden p-2 rounded hover:bg-neutral-100 text-neutral-500 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            placeholder="Search shipments, products…"
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-border bg-neutral-50 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Unread badge */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: accent }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{ background: accent }}
          title={user.name ?? user.email}
        >
          {initials(user.name ?? user.email)}
        </div>
      </div>
    </header>
  );
}
