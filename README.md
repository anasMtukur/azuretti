# Azuretti – Nigeria Export Trade House Platform

A full-stack web platform for **Azuretti Service & Distribution**, the Nigerian Export Trade House in France. Built with Next.js 14, Drizzle ORM, PostgreSQL and NextAuth.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Styling     | Tailwind CSS v3                     |
| Database    | PostgreSQL + Drizzle ORM            |
| Auth        | NextAuth v4 (email/password + JWT)  |
| Forms       | React Hook Form + Zod               |
| UI Extras   | Radix UI, Lucide React, next-themes |
| TypeScript  | Strict mode                         |

---

## Project Structure

```
src/
├── app/
│   ├── (website)/          ← Public-facing website pages
│   │   ├── layout.tsx      ← Navbar + Footer wrapper
│   │   ├── page.tsx        ← Home page
│   │   ├── about/
│   │   ├── commodities/
│   │   ├── compliance/
│   │   ├── contact/
│   │   ├── exporter/
│   │   ├── buyer/
│   │   ├── news/
│   │   └── training/
│   ├── auth/               ← Auth pages (login, register, error)
│   ├── portal/             ← Protected platform (exporter/buyer dashboards)
│   │   ├── layout.tsx      ← Sidebar + Topbar wrapper
│   │   ├── dashboard/      ← Smart redirect by role
│   │   ├── exporter/
│   │   └── buyer/
│   ├── admin/              ← Admin-only section
│   └── api/                ← API routes
│       ├── auth/           ← NextAuth + register
│       └── contact/        ← Contact form submission
│
├── components/
│   ├── providers/          ← ThemeProvider, SessionProvider, ToastProvider
│   ├── ui/                 ← Shared components (Button, DataTable, StatusBadge…)
│   ├── website/            ← Public site components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ContactForm.tsx
│   │   └── sections/       ← Home page sections
│   └── portal/             ← Portal-specific components
│       ├── PortalSidebar.tsx
│       └── PortalTopbar.tsx
│
├── config/
│   └── theme.ts            ← ★ SINGLE SOURCE OF TRUTH for all design tokens
│
├── db/
│   ├── index.ts            ← Drizzle client (singleton)
│   ├── schema.ts           ← All database table definitions
│   └── migrations/         ← Generated SQL migrations
│
└── lib/
    ├── auth/
    │   ├── config.ts       ← NextAuth options
    │   ├── helpers.ts      ← getSession, requireAuth, requireRole
    │   └── types.ts        ← NextAuth type extensions
    └── utils.ts            ← cn(), formatters, helpers
```

---

## Theming

**One file to rule them all:** `src/config/theme.ts`

Change any value in this file to retheme the entire platform:

```ts
// Change the primary brand color
colors: {
  primary: {
    600: "#1c7d4a",  // ← edit this one value to shift the whole brand colour
  }
}

// Change the accent / CTA colour
colors: {
  accent: {
    500: "#f59e0b",  // ← warm amber gold
  }
}

// Change fonts
typography: {
  fonts: {
    display: "'Neue Haas Grotesk', sans-serif",   // headlines
    body:    "'Söhne', system-ui, sans-serif",      // body text
  }
}
```

CSS custom properties (in `globals.css` `:root`) are generated from the same values, so Tailwind classes like `bg-primary-600`, `text-accent-500`, `font-display` always reflect the theme file.

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url> azuretti
cd azuretti
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in DATABASE_URL and NEXTAUTH_SECRET
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Database

Ensure PostgreSQL is running, then:

```bash
# Push schema to the database
npm run db:push

# (Optional) open Drizzle Studio to inspect tables
npm run db:studio
```

### 4. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Authentication Flow

- **Register:** `POST /api/auth/register` → hashes password with bcrypt → inserts into `users` table
- **Login:** NextAuth `CredentialsProvider` → verifies bcrypt hash → issues JWT
- **JWT payload:** contains `id`, `role`
- **Session:** `useSession()` exposes `user.id`, `user.role`, `user.name`, `user.email`
- **Server protection:** `requireAuth()` / `requireRole([...])` in Server Components
- **Middleware:** redirects unauthenticated requests to `/auth/login`; enforces role-based portal access

### User Roles

| Role       | Portal access               |
|------------|-----------------------------|
| `exporter` | `/portal/exporter/*`        |
| `farmer`   | `/portal/exporter/*`        |
| `investor` | `/portal/exporter/*`        |
| `buyer`    | `/portal/buyer/*`           |
| `admin`    | `/admin/*` + all portals    |

---

## Database Schema Overview

| Table                    | Purpose                                     |
|--------------------------|---------------------------------------------|
| `users`                  | All platform users (NextAuth)               |
| `accounts`               | OAuth provider accounts (NextAuth)          |
| `sessions`               | Active sessions (NextAuth)                  |
| `exporter_profiles`      | Exporter company data                       |
| `buyer_profiles`         | Buyer company data                          |
| `commodities`            | Product catalogue                           |
| `inventory`              | Stock levels at Nigerian/French warehouses  |
| `shipments`              | Shipment records with status tracking       |
| `supply_offers`          | Exporter supply submissions                 |
| `buyer_demands`          | Buyer demand requests                       |
| `commodity_prices`       | Market price data (ticker feed)             |
| `training_registrations` | Training course signups                     |
| `contact_submissions`    | Contact form inbox                          |
| `news_events`            | News, events and trade mission posts        |

---

## Website Pages

| Route           | Page                          |
|-----------------|-------------------------------|
| `/`             | Home (hero, stats, commodities, portals CTA) |
| `/about`        | About, vision, values, infrastructure, partnerships |
| `/commodities`  | All commodities listing        |
| `/commodities/[slug]` | Individual commodity detail |
| `/exporter`     | Nigerian Exporters page        |
| `/buyer`        | European Buyers page           |
| `/compliance`   | Compliance & Certification     |
| `/training`     | Training & Capacity Building   |
| `/news`         | News & Trade Missions          |
| `/contact`      | Contact page with form         |

---

## Portal Pages (Phase 2)

| Route                            | Description           |
|----------------------------------|-----------------------|
| `/portal/exporter/dashboard`     | Overview & stats      |
| `/portal/exporter/shipments`     | Shipment tracker table |
| `/portal/exporter/offers`        | Place supply offer    |
| `/portal/exporter/demands`       | Open buyer requests   |
| `/portal/exporter/documents`     | Certificate downloads |
| `/portal/buyer/dashboard`        | Overview & stock      |
| `/portal/buyer/products`         | Available ETH products |
| `/portal/buyer/demands`          | Place demand form     |
| `/portal/buyer/shipments`        | Incoming shipments    |

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly (dev)
npm run db:studio    # Open Drizzle Studio UI
```

---

## Environment Variables Reference

| Variable            | Required | Description                           |
|---------------------|----------|---------------------------------------|
| `DATABASE_URL`      | ✅       | PostgreSQL connection string           |
| `NEXTAUTH_SECRET`   | ✅       | Random secret for JWT signing          |
| `NEXTAUTH_URL`      | ✅       | Full app URL (e.g. https://yourdomain.com) |
| `NEXT_PUBLIC_APP_URL` | —     | Public app URL for client components  |

---

### 🛠️ Development Setup (Hot Reloading)

To enable real-time file watching and hot reloading inside Docker, you need to create a local configuration file that is ignored by Git.

1. **Create the local override file:**  
   In the root directory, create a file named `docker-compose.override.yml`:

```yaml
services:
  app:
    build:
      target: development
    environment:
      - WATCHPACK_POLLING=true
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
```

2. **Start the environment:**  
```bash
docker compose up --build
```

**Note:** The `docker-compose.override.yml` file is listed in `.gitignore` to prevent development settings from affecting the production build. When this file is present, Docker will run the application in `next dev` mode. When it is absent (as in production), Docker defaults to the optimized `standalone` production build.

---

## Reviews 

### O1 - 05/04/2026

- Change request commodity to Propose Commodity - Done
- Add Kyc page to collect - Done
  - Add Export License Number, RC Number, Company Name, Company Email Address, Director's Name, Director's NIN Number for Nigerian Exporter
  - Add Export Company Registration Number, Company Name, Company Address for European Buyer

### O2 - 23/04/2026

- Add Company Email for european buyer KYC - Done

- Add photos to website and fix colors

- Add Buyer specify payment terms to demand  - Done

- Allow uploading stock certification documents to stocks. We should allow adding standard comodity certfications and other with a field name  - Done

- Shipment page that shows list of shipments for admin

- Add payment proof document upload for buyer payment and settlements

- Remove Investor in registration - Done

- Add audit - report of transaction for admin (on exporter and buyer) as well as self audit

- Add sub roles for Admin users: Admin, Content, Sales/Product Manager, Warehouse Manager, Finance, Revenue & Settlements - Pending

*Document version: 1.0 | Prepared for: Azuretti Service & Distribution development team*
