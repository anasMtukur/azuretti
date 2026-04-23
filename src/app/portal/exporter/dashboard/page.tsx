import { requireRole } from "@/lib/auth/helpers";
import { Ship, Package, TrendingUp, DollarSign } from "lucide-react";

export const metadata = { title: "Exporter Dashboard" };

const statCards = [
  { label: "Active Shipments",   value: "3",        icon: Ship,        color: "text-blue-600",   bg: "bg-blue-50" },
  { label: "Open Offers",        value: "2",        icon: Package,     color: "text-primary-600", bg: "bg-primary-50" },
  { label: "Total Shipped (MT)", value: "47.5",     icon: TrendingUp,  color: "text-accent-600",  bg: "bg-accent-50" },
  { label: "Pending Payments",   value: "$12,400",  icon: DollarSign,  color: "text-red-600",     bg: "bg-red-50" },
];

export default async function ExporterDashboardPage() {
  const user = await requireRole(["farmer", "exporter", "admin"]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          Welcome back, {user.name?.split(" ")[0] ?? "Exporter"} 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Track your shipments, contracts and payments in one secure dashboard.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <p className="font-display font-bold text-2xl text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent shipments placeholder */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Recent Shipments
          </h2>
          <a
            href="/portal/exporter/shipments"
            className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
          >
            View all →
          </a>
        </div>

        {/* Empty state */}
        <div className="text-center py-12 text-neutral-400">
          <Ship className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No shipments yet</p>
          <p className="text-xs mt-1">Your shipments will appear here once created.</p>
        </div>
      </div>

      {/* Open buyer requests placeholder */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            Open Buyer Requests
          </h2>
        </div>
        <div className="text-center py-8 text-neutral-400">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Buyer demand opportunities will appear here.</p>
        </div>
      </div>
    </div>
  );
}
