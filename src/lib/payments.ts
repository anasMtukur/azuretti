export const PAYMENT_METHODS: Record<string, string> = {
  wire_transfer:          "Wire Transfer (International)",
  swift:                  "SWIFT Transfer",
  lc:                     "Letter of Credit (L/C)",
  documentary_collection: "Documentary Collection (D/C)",
  cash_advance:           "Cash in Advance",
  other:                  "Other",
};

export const SETTLEMENT_STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:    { label: "Pending",    bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  processing: { label: "Processing", bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  settled:    { label: "Settled",    bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
};

export function generatePaymentRef(sequence: number): string {
  return `PAY-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

export function generateShipmentRef(sequence: number): string {
  return `SHP-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

// ── Shipment documents ─────────────────────────────────────────────────────

export const SHIPMENT_DOC_TYPES: Record<string, { label: string; description: string; required: boolean }> = {
  commercial_invoice:        { label: "Commercial Invoice",          description: "Invoice from seller to buyer detailing goods and price",         required: true  },
  bill_of_lading:            { label: "Bill of Lading (B/L)",        description: "Contract of carriage and title document for sea freight",        required: true  },
  certificate_of_origin:     { label: "Certificate of Origin",       description: "Document certifying the country where goods were produced",      required: true  },
  phytosanitary_certificate: { label: "Phytosanitary Certificate",   description: "Plant health certificate issued by NAQS/FMARD (Nigeria)",       required: true  },
  weight_certificate:        { label: "Weight Certificate",          description: "Official weighbridge or surveyor weight certificate",            required: false },
  packing_list:              { label: "Packing List",                description: "Detailed list of packages, weights and dimensions",             required: false },
  lab_analysis:              { label: "Lab Analysis Report",         description: "Quality and chemical analysis from an accredited laboratory",   required: false },
  insurance_certificate:     { label: "Insurance Certificate",       description: "Marine/cargo insurance certificate for the shipment",           required: false },
  customs_declaration:       { label: "Customs Declaration (SAD)",   description: "Single Administrative Document for customs clearance",         required: false },
  other:                     { label: "Other Document",              description: "Any other supporting shipping document",                        required: false },
};

export const DOC_TYPE_LABELS = Object.entries(SHIPMENT_DOC_TYPES).map(([value, meta]) => ({
  value,
  label:    meta.label,
  required: meta.required,
}));
