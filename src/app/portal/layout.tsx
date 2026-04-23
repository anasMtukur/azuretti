import { requireAuth } from "@/lib/auth/helpers";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const user = await requireAuth();

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <PortalSidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PortalTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
