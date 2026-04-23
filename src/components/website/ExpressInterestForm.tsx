"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name:     z.string().min(2, "Name is required"),
  email:    z.string().email("Valid email required"),
  phone:    z.string().optional(),
  role:     z.enum(["exporter", "buyer", "investor", "other"]),
  interests: z.array(z.string()).min(1, "Select at least one area of interest"),
});

type FormData = z.infer<typeof schema>;

const interestOptions = [
  { value: "trade_mission",    label: "Trade missions to France" },
  { value: "training",         label: "Training sessions" },
  { value: "warehouse",        label: "Warehouse open days" },
  { value: "buyer_seller",     label: "Buyer–seller events" },
  { value: "regulatory",       label: "Regulatory update briefings" },
];

export function ExpressInterestForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interests: [] },
  });

  const selectedInterests = watch("interests") ?? [];

  function toggleInterest(value: string) {
    const current = selectedInterests;
    setValue(
      "interests",
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  }

  async function onSubmit(data: FormData) {
    await fetch("/api/contact", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:    data.name,
        company: "",
        country: "",
        email:   data.email,
        phone:   data.phone ?? "",
        role:    data.role,
        message: `Event interest registration — Interests: ${data.interests.join(", ")}`,
      }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-6 w-6 text-primary-600" />
        </div>
        <p className="font-semibold text-neutral-900 mb-1">You're registered!</p>
        <p className="text-sm text-neutral-500">
          We'll notify you when relevant events are announced.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="label">Full name <span className="text-error">*</span></label>
        <input type="text" className={`input ${errors.name ? "border-error" : ""}`} placeholder="Your name" {...register("name")} />
        {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Email <span className="text-error">*</span></label>
        <input type="email" className={`input ${errors.email ? "border-error" : ""}`} placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Phone</label>
        <input type="tel" className="input" placeholder="+234 ... (optional)" {...register("phone")} />
      </div>

      <div>
        <label className="label">I am a… <span className="text-error">*</span></label>
        <select className={`input bg-white ${errors.role ? "border-error" : ""}`} {...register("role")} defaultValue="">
          <option value="" disabled>Select your role</option>
          <option value="exporter">Nigerian Exporter / Farmer</option>
          <option value="buyer">European Buyer</option>
          <option value="investor">Investor</option>
          <option value="other">Other</option>
        </select>
        {errors.role && <p className="mt-1.5 text-xs text-error">{errors.role.message}</p>}
      </div>

      <div>
        <label className="label">I'm interested in <span className="text-error">*</span></label>
        <div className="space-y-2">
          {interestOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleInterest(value)}
              className={`w-full text-left px-4 py-2.5 rounded border text-sm transition-all duration-150 ${
                selectedInterests.includes(value)
                  ? "border-primary-600 bg-primary-50 text-primary-800 font-medium"
                  : "border-border text-neutral-600 hover:border-primary-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.interests && (
          <p className="mt-1.5 text-xs text-error">{errors.interests.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          "Register Interest"
        )}
      </button>
    </form>
  );
}
