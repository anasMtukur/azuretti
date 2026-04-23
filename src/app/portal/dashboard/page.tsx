import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/helpers";

/**
 * /portal/dashboard — smart redirect based on user role.
 * Server component; runs on every request.
 */
export default async function PortalDashboardPage() {
  const user = await requireAuth();
  switch (user.role) {
    case "admin":
      redirect("/admin/dashboard");
    case "exporter":
    case "farmer":
      redirect("/portal/exporter/dashboard");
    case "buyer":
    default:
      redirect("/portal/buyer/dashboard");
  }
}
