import AuthError from "@/components/auth/AuthError";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

export default function Page() {

  return (
    <div className="animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-6">
        <AlertCircle className="h-6 w-6 text-error" />
      </div>
      
      <Suspense fallback={null}>
        <AuthError />
      </Suspense>
    </div>
  );
}
