import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface Props {
  role: string;
}
export function OnboardingBanner({ role }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 mb-6 rounded-xl bg-accent-50 border border-accent-200">
      <div className="w-9 h-9 rounded-lg bg-accent-100 flex items-center justify-center shrink-0">
        <Sparkles className="h-5 w-5 text-accent-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-accent-900">Personalise your experience</p>
        <p className="text-xs text-accent-700 mt-0.5">
          Complete your profile and select the commodities you're interested in to see live stock details on your dashboard.
        </p>
      </div>
      <Link
        href={`/onboarding/${role}`}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-500 text-neutral-900 text-xs font-semibold hover:bg-accent-600 transition-colors shrink-0"
      >
        Set up now
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
