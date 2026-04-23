import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export const metadata = { title: "Unauthorized | Azuretti" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-8 w-8 text-error" />
        </div>
        <h1 className="font-display font-bold text-2xl text-neutral-900 mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          You don't have permission to view this page. Please sign in with an
          account that has the required access level.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/portal/dashboard" className="btn-primary justify-center text-sm">
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
