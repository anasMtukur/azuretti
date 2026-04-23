"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name:     z.string().min(2, "Name is required"),
  email:    z.string().email("Valid email required"),
  phone:    z.string().min(7, "Phone number required"),
  company:  z.string().optional(),
  type:     z.enum(["virtual", "physical"], { required_error: "Select a training type" }),
  location: z.string().optional(),
  session:  z.string().min(1, "Select a session"),
});

type FormData = z.infer<typeof schema>;

const sessionOptions: Record<string, string[]> = {
  physical: ["Kano – July 2026", "Abuja – September 2026"],
  virtual:  ["Rolling intake – start anytime"],
};

export function TrainingRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const trainingType = watch("type");

  async function onSubmit(data: FormData) {
    // Save to contact submissions table via API
    await fetch("/api/contact", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:    data.name,
        company: data.company ?? "",
        country: "Nigeria",
        email:   data.email,
        phone:   data.phone,
        role:    "exporter",
        message: `Training registration request — Type: ${data.type}, Session: ${data.session}`,
      }),
    });
    setSubmitted(true);
    reset();
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-primary-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
          Registration received!
        </h3>
        <p className="text-sm text-neutral-500">
          Our team will contact you within 2 business days with payment details
          and session confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Full name <span className="text-error">*</span></label>
          <input type="text" className={`input ${errors.name ? "border-error" : ""}`} placeholder="Your name" {...register("name")} />
          {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Phone <span className="text-error">*</span></label>
          <input type="tel" className={`input ${errors.phone ? "border-error" : ""}`} placeholder="+234 ..." {...register("phone")} />
          {errors.phone && <p className="mt-1.5 text-xs text-error">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Email <span className="text-error">*</span></label>
        <input type="email" className={`input ${errors.email ? "border-error" : ""}`} placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Company / Organisation</label>
        <input type="text" className="input" placeholder="Optional" {...register("company")} />
      </div>

      {/* Training type */}
      <div>
        <label className="label">Training type <span className="text-error">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {(["virtual", "physical"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setValue("type", t); setValue("session", ""); }}
              className={`p-3 rounded border text-sm font-medium capitalize transition-all ${
                trainingType === t
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-border text-neutral-600 hover:border-primary-300"
              }`}
            >
              {t === "virtual" ? "🌐 Virtual — ₦50,000" : "🏢 Physical — ₦150,000"}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("type")} />
        {errors.type && <p className="mt-1.5 text-xs text-error">{errors.type.message}</p>}
      </div>

      {/* Session */}
      {trainingType && (
        <div>
          <label className="label">Select session <span className="text-error">*</span></label>
          <select className={`input bg-white ${errors.session ? "border-error" : ""}`} {...register("session")} defaultValue="">
            <option value="" disabled>Choose a session</option>
            {sessionOptions[trainingType].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.session && <p className="mt-1.5 text-xs text-error">{errors.session.message}</p>}
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-2">
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          "Register Interest"
        )}
      </button>
    </form>
  );
}
