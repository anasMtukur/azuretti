import { requireRole } from "@/lib/auth/helpers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["admin"]);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PortalTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}