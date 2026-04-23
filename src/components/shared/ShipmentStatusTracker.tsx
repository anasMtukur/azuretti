/**
 * src/components/shared/ShipmentStatusTracker.tsx
 *
 * Reusable visual component showing:
 *   1. A horizontal route bar (port → icon → port) with the current
 *      status highlighted.
 *   2. A chronological event log — each event has a status badge,
 *      short note, and date.
 *
 * Used on:
 *   - src/app/admin/shipments/[id]/page.tsx   (full edit + log)
 *   - src/app/portal/buyer/shipments/[id]/page.tsx  (read-only)
 */

import { cn } from "@/lib/utils";
import {
  CheckCircle2, Package, Ship, Anchor,
  Clock, XCircle, MapPin,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | "booked"
  | "loaded"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface StatusEvent {
  id:        string;
  status:    ShipmentStatus;
  note:      string | null;
  eventDate: Date | string;
}

interface Props {
  currentStatus:   ShipmentStatus;
  originPort:      string | null;
  destinationPort: string | null;
  events:          StatusEvent[];
}

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ShipmentStatus, {
  label:   string;
  Icon:    React.ElementType;
  bg:      string;
  text:    string;
  dot:     string;
  border:  string;
  step:    number;   // 0-based order for the route bar
}> = {
  booked:     { label: "Booked",     Icon: CheckCircle2, bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6", border: "#bfdbfe", step: 0 },
  loaded:     { label: "Loaded",     Icon: Package,      bg: "#fef3c7", text: "#92400e", dot: "#f59e0b", border: "#fde68a", step: 1 },
  in_transit: { label: "In Transit", Icon: Ship,         bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed", border: "#ddd6fe", step: 2 },
  delivered:  { label: "Delivered",  Icon: Anchor,       bg: "#dcfce7", text: "#166534", dot: "#16a34a", border: "#bbf7d0", step: 3 },
  cancelled:  { label: "Cancelled",  Icon: XCircle,      bg: "#fee2e2", text: "#991b1b", dot: "#dc2626", border: "#fecaca", step: -1 },
};

const ROUTE_STEPS: ShipmentStatus[] = ["booked", "loaded", "in_transit", "delivered"];

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Status badge (exported for standalone use) ─────────────────────────────

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const c = STATUS_CONFIG[status];
  const { Icon } = c;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ShipmentStatusTracker({
  currentStatus,
  originPort,
  destinationPort,
  events,
}: Props) {
  const currentStep = STATUS_CONFIG[currentStatus]?.step ?? -1;
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-6">

      {/* ── Route bar ───────────────────────────────────── */}
      <div className="p-5 rounded-xl border border-border bg-white">

        {/* Port labels */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <Anchor className="h-4 w-4 text-primary-500 shrink-0" />
            {originPort ?? "Origin"}
          </div>
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            {destinationPort ?? "Destination"}
            <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
          </div>
        </div>

        {/* Step dots + connectors */}
        {!isCancelled ? (
          <div className="flex items-center">
            {ROUTE_STEPS.map((s, i) => {
              const cfg     = STATUS_CONFIG[s];
              const { Icon } = cfg;
              const done    = cfg.step <= currentStep;
              const active  = s === currentStatus;
              const isLast  = i === ROUTE_STEPS.length - 1;

              return (
                <div key={s} className="flex-1 flex items-center">
                  {/* Node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        done
                          ? "shadow-sm"
                          : "bg-neutral-100 border border-border"
                      )}
                      style={done ? { background: cfg.bg, border: `2px solid ${cfg.border}` } : undefined}
                    >
                      <Icon
                        className={cn("h-4 w-4", done ? "" : "text-neutral-300")}
                        style={done ? { color: cfg.text } : undefined}
                      />
                    </div>
                    <span
                      className={cn("mt-1.5 text-[11px] font-semibold text-center leading-tight max-w-[64px]",
                        active ? "" : done ? "text-neutral-500" : "text-neutral-300"
                      )}
                      style={active ? { color: cfg.text } : undefined}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-2 mt-[-18px]"
                      style={{
                        background: cfg.step < currentStep
                          ? STATUS_CONFIG[ROUTE_STEPS[i + 1]].dot
                          : "#e5e7eb",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-semibold text-red-600">Shipment Cancelled</span>
          </div>
        )}
      </div>

      {/* ── Event log ───────────────────────────────────── */}
      {events.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-0.5">
            Status History
          </p>

          {[...events]
            .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
            .map((evt, i) => {
              const cfg     = STATUS_CONFIG[evt.status];
              const { Icon } = cfg;
              const isLatest = i === 0;

              return (
                <div
                  key={evt.id}
                  className={cn(
                    "flex items-start gap-3.5 p-4 rounded-xl border transition-colors",
                    isLatest ? `border-[${cfg.border}]` : "border-border bg-white"
                  )}
                  style={isLatest ? { background: cfg.bg, borderColor: cfg.border } : undefined}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border"
                    style={{ borderColor: cfg.border, color: cfg.text }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                      {isLatest && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                          style={{ background: cfg.dot + "22", color: cfg.text }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    {evt.note && (
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        {evt.note}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0 pt-0.5">
                    {fmtDate(evt.eventDate)}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      {events.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-50 border border-border">
          <Clock className="h-4 w-4 text-neutral-300 shrink-0" />
          <p className="text-sm text-neutral-400">No status updates logged yet.</p>
        </div>
      )}
    </div>
  );
}