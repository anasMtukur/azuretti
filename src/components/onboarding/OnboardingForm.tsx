// app/onboarding/[role]/BuyerOnboardingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { useSession } from "next-auth/react";
import ExporterCompanyForm, { ExporterData } from "./ExporterCompanyForm";
import BuyerCompanyForm, { BuyerData } from "./BuyerCompanyForm";
import StepIndicator, { Step } from "./StepIndicator";
import CommodityPicker from "./CommodityPicker";

export interface Commodity {
  id: string;
  name: string;
  category: string;
}

interface Props {
  params: { role: string };
  commodityOptions: Commodity[];
}

export default function OnboardingForm({
  commodityOptions,
}: Props) {
  const router = useRouter();
  const { error } = useToast();
  const { data: session }   = useSession();

  const role                = session?.user?.role;
  const isBuyer             = role === "buyer";
  const isExporter          = role === "exporter" || role === "farmer";


  const [step, setStep]                   = useState<1 | 2>(1);
  const [submitting, setSubmitting]        = useState(false);
  
  const [companyData, setCompanyData] = useState<ExporterData | BuyerData | null>(null);

  function handleCompanyNext(data: ExporterData | BuyerData) {
    setCompanyData(data);
    setStep(2);
  }

  const headings: Record<Step, { title: string; subtitle: string }> = {
    1: {
      title:    "Tell us about your company",
      subtitle: isBuyer
        ? "Help us verify your business and tailor your sourcing experience."
        : "We need these details for KYC and NEPC compliance.",
    },
    2: {
      title:    isBuyer ? "What are you looking to source?" : "What do you export?",
      subtitle: isBuyer
        ? "Select 1-3 commodities you're most interested in. We'll show live stock on your dashboard."
        : "Select 1-3 commodities you produce or plan to export through Azuretti.",
    },
  };

  const { title, subtitle } = headings[step];

  async function handleFinish(commodityIds: string[]) {
    if (!companyData) return;
    setSubmitting(true);
    try {
      const endpoint = isBuyer
        ? "/api/onboarding/buyer"
        : "/api/onboarding/exporter";

      const res = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...companyData, interestedCommodities: commodityIds }),
      });

      if (!res.ok) {
        const json = await res.json();
        error("Setup failed", json.error ?? "Please try again.");
        return;
      }

      router.push("/portal/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  // Group commodities by category for the picker

  return (
    <div className="animate-fade-up">
      {/* Step indicator */}
      <StepIndicator step={step} role={role} />

      {/* Heading */}
      <div className="mb-7">
        <h1 className="font-display font-bold text-2xl text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{subtitle}</p>
      </div>

      {/* Step 1 — role-specific company form */}
      {step === 1 && isExporter && (
        <ExporterCompanyForm onNext={handleCompanyNext as (d: ExporterData) => void} />
      )}
      {step === 1 && isBuyer && (
        <BuyerCompanyForm onNext={handleCompanyNext as (d: BuyerData) => void} />
      )}
      {step === 1 && !isExporter && !isBuyer && (
        // Fallback — shouldn't normally reach here
        <div className="p-6 rounded-xl bg-neutral-50 border border-border text-center">
          <p className="text-sm text-neutral-500">
            Onboarding is not required for your account type.
          </p>
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="btn-primary mt-4 text-sm px-5 py-2"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* ── Step 2: Commodity preferences ─────────────────────────── */}
      {step === 2 && (
        <CommodityPicker
          commodityOptions={commodityOptions}
          role={role}
          onBack={() => setStep(1)}
          onFinish={handleFinish}
          submitting={submitting}
        />
      )}
    </div>
  );
}