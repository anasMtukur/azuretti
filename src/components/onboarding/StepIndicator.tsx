import { Building2, Tag, CheckCircle2 } from "lucide-react";

export type Step = 1 | 2;

export default function StepIndicator({
  step,
  role,
}: {
  step: Step;
  role: string | undefined;
}) {
  const isBuyer = role === "buyer";
  const steps = [
    { n: 1, label: "Company Details", icon: Building2 },
    ...(isBuyer
      ? [{ n: 2, label: "Commodity Interests", icon: Tag }]
      : [{ n: 2, label: "Commodity Interests", icon: Tag }]),
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map(({ n, label, icon: Icon }, i) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > n
                ? "bg-primary-600 text-white"
                : step === n
                ? "bg-primary-600 text-white ring-4 ring-primary-100"
                : "bg-neutral-100 text-neutral-400"
            }`}
          >
            {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
          </div>
          <span
            className={`text-sm font-medium hidden sm:block ${
              step >= n ? "text-neutral-800" : "text-neutral-400"
            }`}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${step > n ? "bg-primary-400" : "bg-neutral-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}