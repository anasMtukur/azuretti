"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name:    z.string().min(2, "Name is required"),
  company: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  email:   z.string().email("Enter a valid email"),
  phone:   z.string().optional(),
  role:    z.enum(["exporter", "buyer", "investor", "other"], {
    required_error: "Please select your role",
  }),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/contact", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
      reset();
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
          Message sent!
        </h3>
        <p className="text-sm text-neutral-500 mb-6">
          Thank you for reaching out. Our team will reply within one business day.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Name + Company */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Full name <span className="text-error">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            className={`input ${errors.name ? "border-error" : ""}`}
            placeholder="Your full name"
            {...register("name")}
          />
          {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="contact-company" className="label">
            Company
          </label>
          <input
            id="contact-company"
            type="text"
            className="input"
            placeholder="Your company (optional)"
            {...register("company")}
          />
        </div>
      </div>

      {/* Country + Email */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-country" className="label">
            Country <span className="text-error">*</span>
          </label>
          <input
            id="contact-country"
            type="text"
            className={`input ${errors.country ? "border-error" : ""}`}
            placeholder="e.g. Nigeria, France"
            {...register("country")}
          />
          {errors.country && <p className="mt-1.5 text-xs text-error">{errors.country.message}</p>}
        </div>

        <div>
          <label htmlFor="contact-email" className="label">
            Email <span className="text-error">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            className={`input ${errors.email ? "border-error" : ""}`}
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
        </div>
      </div>

      {/* Phone + Role */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="label">Phone</label>
          <input
            id="contact-phone"
            type="tel"
            className="input"
            placeholder="+234 ..."
            {...register("phone")}
          />
        </div>

        <div>
          <label htmlFor="contact-role" className="label">
            I am a… <span className="text-error">*</span>
          </label>
          <select
            id="contact-role"
            className={`input bg-white ${errors.role ? "border-error" : ""}`}
            {...register("role")}
            defaultValue=""
          >
            <option value="" disabled>Select your role</option>
            <option value="exporter">Nigerian Exporter</option>
            <option value="buyer">European Buyer</option>
            <option value="investor">Investor</option>
            <option value="other">Other</option>
          </select>
          {errors.role && <p className="mt-1.5 text-xs text-error">{errors.role.message}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="label">
          Message <span className="text-error">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className={`input resize-none ${errors.message ? "border-error" : ""}`}
          placeholder="Tell us about your enquiry — what commodities are you interested in, what quantities, and what timeline?"
          {...register("message")}
        />
        {errors.message && <p className="mt-1.5 text-xs text-error">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
