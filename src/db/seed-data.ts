/**
 * src/db/seed-data.ts
 * ============================================================
 * Static seed data — admin user and full commodity catalogue.
 * Edit this file to change seed values; re-run `npm run db:seed`
 * to apply changes (existing records are upserted, not duplicated).
 * ============================================================
 */

// ── Admin user ─────────────────────────────────────────────────────────────
// Password is read from ADMIN_PASSWORD env var so it never lives
// in source code. Falls back to a strong default for local dev only.
export const ADMIN_SEED = {
  name:  "Azuretti Admin",
  email: "admin@azurettiservices.fr",
  role:  "admin" as const,
};

// ── Commodity catalogue ────────────────────────────────────────────────────
export type SeedCommodity = {
  name:             string;
  slug:             string;
  category:         "pulses" | "grains" | "seeds" | "nuts";
  description:      string;
  grades:           string[];
  packagingOptions: string[];
  minOrderQtyMt:    string;
  certifications:   string[];
  sortOrder:        number;
};

export const COMMODITY_SEED: SeedCommodity[] = [
  // ── Pulses ───────────────────────────────────────────────
  {
    name:             "Hibiscus Flower",
    slug:             "hibiscus-flower",
    category:         "pulses",
    description:
      "High-quality dried hibiscus (Roselle / Zobo), sourced from Northern Nigeria and processed to EU food safety and MRL standards. Used in herbal teas, food colouring and pharmaceutical applications.",
    grades:           ["Grade A – Whole calyces", "Grade B – Mixed / broken", "Grade C – Powder"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg jute bags", "Custom on request"],
    minOrderQtyMt:    "5.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate", "Certificate of Origin"],
    sortOrder:        10,
  },
  {
    name:             "Gum Arabic (Acacia Gum)",
    slug:             "gum-arabic",
    category:         "pulses",
    description:
      "Premium Acacia senegal and Acacia seyal gum sourced from northern Nigeria. Used in food emulsification, pharmaceutical binding, cosmetics and industrial applications. Full traceability from tree to export.",
    grades:           ["Kibbled – Hand-picked select", "Spray-dried powder", "Ribbon grade"],
    packagingOptions: ["25 kg paper bags", "50 kg fibre drums", "Bulk big bags (500 kg)"],
    minOrderQtyMt:    "2.00",
    certifications:   ["Certificate of Analysis (SGS/BV)", "HACCP compliance", "Certificate of Origin", "Phytosanitary Certificate"],
    sortOrder:        20,
  },
  {
    name:             "Cassia Tora",
    slug:             "cassia-tora",
    category:         "pulses",
    description:
      "Industrial-grade Cassia Tora seeds from Nigerian farms. Used as a natural alternative to guar gum in food thickening, as a binder in animal feed and in pet food manufacturing.",
    grades:           ["Sortex clean", "FAQ (Fair Average Quality)"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg jute bags"],
    minOrderQtyMt:    "5.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate"],
    sortOrder:        30,
  },
  {
    name:             "Dried Split Ginger",
    slug:             "dried-split-ginger",
    category:         "pulses",
    description:
      "Aromatic Nigerian ginger (Zingiber officinale), split and sun-dried to specification for EU export. Known for high gingerol content and strong flavour profile. Compliant with EU MRL requirements.",
    grades:           ["Split dried – Low moisture (≤ 10%)", "Whole dried", "Powder"],
    packagingOptions: ["25 kg jute bags", "50 kg jute bags", "Custom cartons"],
    minOrderQtyMt:    "5.00",
    certifications:   ["Certificate of Analysis (SGS/BV)", "Phytosanitary Certificate", "Certificate of Origin"],
    sortOrder:        40,
  },
  {
    name:             "Beans",
    slug:             "beans",
    category:         "pulses",
    description:
      "Selected varieties of Nigerian cowpeas and brown beans with consistent protein content, moisture control and clean sortex processing. Suitable for food manufacturing and retail packaging.",
    grades:           ["White Honey Beans", "Brown Beans – Sortex clean", "Black-eyed Peas"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg jute bags", "Retail-ready packs on request"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate"],
    sortOrder:        50,
  },

  // ── Grains ───────────────────────────────────────────────
  {
    name:             "Sorghum",
    slug:             "sorghum",
    category:         "grains",
    description:
      "Premium white and red sorghum from Nigerian farms across Kano, Kaduna and Plateau states. Ideal for food manufacturing, animal feed, malting and brewing. Consistent specifications and low aflatoxin levels.",
    grades:           ["White sorghum – Sortex clean", "Red sorghum – FAQ", "Malting grade"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg bags", "Bulk containers"],
    minOrderQtyMt:    "20.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate", "Mycotoxin test report"],
    sortOrder:        60,
  },
  {
    name:             "Cassava Chips",
    slug:             "cassava-chips",
    category:         "grains",
    description:
      "Dried cassava chips produced from fresh Nigerian cassava roots. Used in starch processing, animal feed, ethanol production and as a carbohydrate source in composite flour manufacturing.",
    grades:           ["Low-moisture chips (≤ 12%)", "Standard FAQ grade"],
    packagingOptions: ["50 kg jute bags", "Bulk big bags (1 MT)", "Bulk containers"],
    minOrderQtyMt:    "20.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate"],
    sortOrder:        70,
  },
  {
    name:             "Millet",
    slug:             "millet",
    category:         "grains",
    description:
      "Pearl and finger millet varieties sourced from northern Nigerian farms. Low moisture content, EU-compliant packaging and mycotoxin-tested. Suitable for food, feed and specialty health food markets.",
    grades:           ["Pearl millet – Sortex clean", "Finger millet – FAQ"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg bags"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate", "Mycotoxin test report"],
    sortOrder:        80,
  },
  {
    name:             "Zeenab Premium Rice",
    slug:             "zeenab-premium-rice",
    category:         "grains",
    description:
      "Award-winning premium parboiled rice from the Zeenab Foods portfolio, milled and packaged in Nigeria. Consistent grain size, low breakage and excellent cooking quality for European retail and food service.",
    grades:           ["Premium long grain parboiled", "Standard parboiled"],
    packagingOptions: ["5 kg retail bags", "25 kg bags", "50 kg bags"],
    minOrderQtyMt:    "5.00",
    certifications:   ["Certificate of Analysis", "Certificate of Origin", "NAFDAC registration"],
    sortOrder:        90,
  },

  // ── Seeds ────────────────────────────────────────────────
  {
    name:             "Sesame Seeds",
    slug:             "sesame-seeds",
    category:         "seeds",
    description:
      "White and mixed sesame seeds (Sesamum indicum) from central and northern Nigeria. High oil content (48–52%), low moisture and low FFA. Extensively tested against EU MRL thresholds for pesticide residues.",
    grades:           ["White – Sortex clean, 99.95% purity", "Mixed natural – 99% purity", "Hulled white"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg jute bags", "Bulk big bags"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis (SGS/BV)", "Phytosanitary Certificate", "Certificate of Origin", "Pesticide residue report"],
    sortOrder:        100,
  },
  {
    name:             "Sunflower Seeds",
    slug:             "sunflower-seeds",
    category:         "seeds",
    description:
      "High-oleic and standard sunflower seeds suitable for confectionery, oil pressing, bakery and food manufacturing. Sourced from Nigerian farms and tested for EU compliance.",
    grades:           ["High-oleic – Confectionery grade", "Standard oil-type", "Hulled kernels"],
    packagingOptions: ["25 kg polypropylene bags", "50 kg bags"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis", "Phytosanitary Certificate"],
    sortOrder:        110,
  },
  {
    name:             "Cocoa Beans",
    slug:             "cocoa-beans",
    category:         "seeds",
    description:
      "Fermented and sun-dried Nigerian cocoa beans from southwestern Nigeria. Full origin and quality documentation including fermentation and moisture content reports. Suitable for premium chocolate manufacturing.",
    grades:           ["Grade 1 – Main crop, min. 100 beans/100g", "Grade 2 – Light crop"],
    packagingOptions: ["65 kg jute bags (standard export)", "Custom on request"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis (SGS/BV)", "Certificate of Origin", "Phytosanitary Certificate", "Cocoa bean count report"],
    sortOrder:        120,
  },

  // ── Nuts ─────────────────────────────────────────────────
  {
    name:             "Raw Cashew Nut",
    slug:             "raw-cashew-nut",
    category:         "nuts",
    description:
      "Grade 1 raw cashew nuts (RCN) sourced from Nigerian farms in Kogi, Enugu and Benue states. Tested for aflatoxin, moisture and KOR (kernel outturn ratio). Suitable for processing and re-export to European markets.",
    grades:           ["Grade 1 – KOR ≥ 48 lbs/80 kg", "Grade 2 – KOR 44–47 lbs", "FAQ – Mixed grade"],
    packagingOptions: ["80 kg jute bags (standard)", "50 kg bags on request"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis (aflatoxin, moisture, KOR)", "Phytosanitary Certificate", "Certificate of Origin"],
    sortOrder:        130,
  },
  {
    name:             "Sheanuts",
    slug:             "sheanuts",
    category:         "nuts",
    description:
      "Natural sheanuts (Vitellaria paradoxa) sourced from northern Nigerian communities. Used for shea butter extraction in cosmetics, personal care and food-grade fat applications. Female-farmer network sourcing available.",
    grades:           ["Grade A – Sun-dried, ≥ 42% FFA butter yield", "Grade B – Mixed/FAQ"],
    packagingOptions: ["50 kg jute bags", "100 kg bags", "Bulk big bags"],
    minOrderQtyMt:    "10.00",
    certifications:   ["Certificate of Analysis (FFA, moisture, butter yield)", "Phytosanitary Certificate", "Certificate of Origin"],
    sortOrder:        140,
  },
];