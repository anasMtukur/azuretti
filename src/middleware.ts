import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware
 * ============================================================
 * Protects platform routes and enforces role-based access.
 *
 * Route structure:
 *   /              → public website
 *   /auth/*        → auth pages (redirect if already logged in)
 *   /portal/*      → protected – any authenticated user
 *   /portal/exporter/* → protected – exporters only
 *   /portal/buyer/*    → protected – buyers only
 *   /admin/*       → protected – admin only
 * ============================================================
 */
const ROLE_ROUTES: Record<string, string[]> = {
  system_admin:      ["/admin/dashboard", "/admin/users", "/admin/warehouse", "/admin/demands", "/admin/shipments", "/admin/commodities", "/admin/commodity-prices", "/admin/contacts", "/admin/news", "/admin/finance", "/admin/reports"],
  warehouse_manager: ["/admin/dashboard", "/admin/warehouse", "/admin/demands", "/admin/shipments", "/admin/reports"],
  content_manager:   ["/admin/commodities", "/admin/commodity-prices", "/admin/contacts", "/admin/news"],
  finance_manager:   ["/admin/finance", "/admin/reports"],
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: { role?: string, adminRole?: string | null } | null } }) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    const role = token?.role;
    const adminRole = token?.adminRole;

    // Redirect logged-in users away from auth pages
    if (pathname.startsWith("/auth/") && token) {
      const dest = getRoleHomePath(role);
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // Enforce role-specific portal access
    if (pathname.startsWith("/portal/exporter") && role !== "exporter"  && role !== "farmer" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/portal/buyer") && role !== "buyer" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Enforce adminRole sub-route access
    if (pathname.startsWith("/admin") && role === "admin") {
      const adminRole = token?.adminRole;
      if (adminRole && adminRole in ROLE_ROUTES) {
        const allowed = ROLE_ROUTES[adminRole];
        const isAllowed = allowed.some((route) => pathname.startsWith(route));
        if (!isAllowed) {
          return NextResponse.redirect(new URL(allowed[0], req.url));
        }
      }
      // No adminRole set = legacy/super admin, allow everything
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * authorized – return true to allow the request,
       * false to redirect to the sign-in page.
       */
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes – always allow
        const publicPaths = ["/", "/about", "/commodities", "/compliance", "/training", "/news", "/contact", "/exporter", "/buyer"];
        if (publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
          return true;
        }

        // Auth routes – allow whether logged in or not (middleware handles redirect)
        if (pathname.startsWith("/auth/")) return true;

        // Unauthorized page
        if (pathname === "/unauthorized") return true;

        // API routes that don't need auth
        if (pathname.startsWith("/api/auth/")) return true;

        // API routes that don't need auth
        if (pathname.startsWith("/api/commodity-prices")) return true;

        // Protected routes require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};

function getRoleHomePath(role?: string): string {
  switch (role) {
    case "admin":    return "/admin/dashboard";
    case "exporter": return "/portal/exporter/dashboard";
    case "buyer":    return "/portal/buyer/dashboard";
    default:         return "/portal/dashboard";
  }
}
