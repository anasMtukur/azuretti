export const DEMAND_STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  draft:        { label: "Draft",        bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  submitted:    { label: "Submitted",    bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  under_review: { label: "Under Review", bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  quoted:       { label: "Quoted",       bg: "#ede9fe", text: "#5b21b6", dot: "#7c3aed" },
  accepted:     { label: "Accepted",     bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  rejected:     { label: "Rejected",     bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
  allocated:    { label: "Allocated",    bg: "#cffafe", text: "#155e75", dot: "#06b6d4" },
  fulfilled:    { label: "Fulfilled",    bg: "#dcf5e5", text: "#176340", dot: "#16a34a" },
  cancelled:    { label: "Cancelled",    bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8" },
};

export const QTY_LOCK_META: Record<string, { label: string; description: string; bg: string; text: string }> = {
  locked:  {
    label:       "Locked",
    description: "Quantity is fixed. The buyer cannot change it when accepting.",
    bg: "#ede9fe", text: "#5b21b6",
  },
  min_qty: {
    label:       "Minimum qty",
    description: "Buyer can increase the quantity above the quoted amount at the same unit price.",
    bg: "#dcfce7", text: "#166534",
  },
  open:    {
    label:       "Open",
    description: "Buyer can raise or reduce the quantity freely when accepting.",
    bg: "#dbeafe", text: "#1e40af",
  },
};

export const CONTAINER_SIZES = [
  { value: "20ft",    label: '20\' Standard (≈ 24 MT)' },
  { value: "40ft",    label: '40\' Standard (≈ 26 MT)' },
  { value: "40ft_hc", label: '40\' High Cube (≈ 28 MT)' },
  { value: "bulk",    label: 'Bulk / partial load' },
  { value: "flexibag",label: 'Flexibag (liquid bulk)' },
];

export const INCOTERMS = ["EXW","FCA","FAS","FOB","CFR","CIF","CPT","CIP","DPU","DAP","DDP"];

export const PACKAGING_TYPES = [
  "25 kg polypropylene bags",
  "50 kg jute bags",
  "50 kg polypropylene bags",
  "80 kg jute bags (standard RCN)",
  "1 MT bulk bag (jumbo)",
  "Custom — specify in requirements",
];

/** Generate sequential reference codes */
export function generateDemandRef(sequence: number): string {
  return `DR-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

export function generateQuoteRef(sequence: number): string {
  return `QT-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;
}