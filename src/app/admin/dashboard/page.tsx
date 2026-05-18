import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { users, commodities, shipments, contactSubmissions } from "@/db/schema";

import { count, eq } from "drizzle-orm";
import { Users, Package, Ship, MessageSquare, UserCheck, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const db = getDb();

export const metadata = { title: "Admin Dashboard – Azuretti" };

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);
  // Parallel DB queries for stats
  const [
    [{ total: totalUsers }],
    [{ total: totalCommodities }],
    [{ total: totalShipments }],
    [{ total: unreadContacts }],
    [{ total: exporterCount }],
    [{ total: buyerCount }],
    recentUsers,
    recentContacts,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(commodities),
    db.select({ total: count() }).from(shipments),
    db.select({ total: count() }).from(contactSubmissions)
      .where(eq(contactSubmissions.isRead, false)),
    db.select({ total: count() }).from(users).where(eq(users.role, "exporter")),
    db.select({ total: count() }).from(users).where(eq(users.role, "buyer")),
    db.select({
      id: users.id, name: users.name, email: users.email,
      role: users.role, createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt).limit(5),
    db.select({
      id: contactSubmissions.id, name: contactSubmissions.name,
      email: contactSubmissions.email, role: contactSubmissions.role,
      createdAt: contactSubmissions.createdAt,
    }).from(contactSubmissions)
      .where(eq(contactSubmissions.isRead, false))
      .orderBy(contactSubmissions.createdAt)
      .limit(5),
  ]);

  const statCards = [
    { label: "Total Users",      value: totalUsers,      icon: Users,        href: "/admin/users",       color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Commodities",      value: totalCommodities,icon: Package,      href: "/admin/commodities", color: "text-primary-600", bg: "bg-primary-50" },
    { label: "Shipments",        value: totalShipments,  icon: Ship,         href: "/admin/shipments",   color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Unread Enquiries", value: unreadContacts,  icon: MessageSquare,href: "/admin/contacts",    color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Exporters",        value: exporterCount,   icon: UserCheck,    href: "/admin/users?role=exporter", color: "text-green-600", bg: "bg-green-50" },
    { label: "Buyers",           value: buyerCount,      icon: UserCheck,    href: "/admin/users?role=buyer",    color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const roleColors: Record<string, string> = {
    admin:    "bg-purple-100 text-purple-700",
    exporter: "bg-primary-100 text-primary-700",
    buyer:    "bg-blue-100 text-blue-700",
    investor: "bg-amber-100 text-amber-700",
    farmer:   "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Platform overview and quick actions.</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-2xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-neutral-900">Recent Registrations</h2>
            <Link href="/admin/users" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              View all →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                    {(u.name ?? u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{u.name ?? "—"}</p>
                    <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge text-[10px] ${roleColors[u.role] ?? "bg-neutral-100 text-neutral-600"}`}>
                      {u.role}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unread contacts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-neutral-900">
              Unread Enquiries
              {unreadContacts > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  {unreadContacts}
                </span>
              )}
            </h2>
            <Link href="/admin/contacts" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              View all →
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No unread enquiries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{c.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
