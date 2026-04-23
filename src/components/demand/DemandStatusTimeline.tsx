"use client";

import { CheckCircle2 } from "lucide-react";

type DemandStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "quoted"
  | "accepted"
  | "allocated"
  | "fulfilled"
  | "cancelled"
  | "rejected";

interface Props {
  demandStatus: DemandStatus;
}

const STATUS_ORDER: Exclude<DemandStatus, "cancelled">[] = [
  "submitted",
  "under_review",
  "quoted",
  "accepted",
  "allocated",
  "fulfilled",
];

function formatLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DemandStatusTimeline({ demandStatus }: Props) {
  const isCancelled = demandStatus === "cancelled";
  const isRejected = demandStatus === "rejected";

  const currentIndex = STATUS_ORDER.indexOf(
    demandStatus as (typeof STATUS_ORDER)[number]
  );

  const steps = STATUS_ORDER.map((status, i) => ({
    label: formatLabel(status),
    done: !isCancelled && i <= currentIndex,
    isCancelled: false,
  }));

  if (isCancelled) {
    steps.push({
      label: "Cancelled",
      done: true,
      isCancelled: true,
    } as const);
  }

  if (isRejected) {
    steps.push({
      label: "Rejected",
      done: true,
      isCancelled: true,
    } as const);
  }

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-base text-neutral-900 mb-5">
        Timeline
      </h2>

      <div>
        {steps.map(({ label, done, isCancelled }, i) => (
          <div key={label} className="flex gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isCancelled
                    ? "bg-red-600"
                    : done
                    ? "bg-primary-600"
                    : "bg-neutral-100 border border-border"
                }`}
              >
                {isCancelled ? (
                  <span className="w-2 h-0.5 bg-white rounded-full" />
                ) : done ? (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                )}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-1 ${
                    isCancelled
                      ? "bg-red-200"
                      : done
                      ? "bg-primary-200"
                      : "bg-neutral-100"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <p
              className={`text-sm font-medium pt-0.5 ${
                isCancelled
                  ? "text-red-600"
                  : done
                  ? "text-neutral-900"
                  : "text-neutral-400"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {isCancelled && (
        <p className="text-xs text-red-500 mt-3">
          This demand was cancelled and will not proceed further.
        </p>
      )}
    </div>
  );
}