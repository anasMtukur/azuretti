"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const schema = z
  .object({
    name:     z.string().min(2, "Name must be at least 2 characters"),
    email:    z.string().email("Enter a valid email address"),
    role:     z.enum(["exporter", "buyer", "investor", "farmer"]),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const roleOptions = [
  { value: "exporter", label: "Nigerian Exporter",  description: "I want to export commodities to Europe" },
  { value: "buyer",    label: "European Buyer",      description: "I want to source Nigerian products" },
  { value: "farmer",   label: "Farmer / Supplier",   description: "I supply raw commodities" },
] as const;

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();
  const [showPw, setShowPw] = useState(false);

  const defaultRole =
    (searchParams.get("role") as "exporter" | "buyer" | "investor" | "farmer") ??
    "buyer";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", role: defaultRole, password: "", confirmPassword: "" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: any) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toastError("Registration failed", json.error ?? "Please try again.");
        return;
      }

      toastSuccess("Account created!", "Signing you in…");

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push(`/onboarding/${data.role}`);
      router.refresh();
    } catch {
      toastError("Something went wrong", "Please try again later.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Role selector */}
        <div>
          <label className="label">I am a…</label>
          <div className="grid grid-cols-1 gap-2">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("role", opt.value)}
                className={`text-left p-3 rounded border text-sm transition-all duration-150 ${
                  selectedRole === opt.value
                    ? "border-primary-600 bg-primary-50 text-primary-800"
                    : "border-border text-neutral-600 hover:border-primary-300 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {selectedRole === opt.value && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                  )}
                  <span className="font-semibold">{opt.label}</span>
                </div>
                <span className="text-xs text-neutral-400 leading-snug">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" {...register("role")} />
          {errors.role && (
            <p className="mt-1.5 text-xs text-error">{errors.role.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={`input ${errors.name ? "border-error" : ""}`}
            placeholder="Your full name"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="label">Email address</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? "border-error" : ""}`}
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="label">Password</label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              className={`input pr-10 ${errors.password ? "border-error" : ""}`}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-error">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirm-password" className="label">Confirm password</label>
          <input
            id="confirm-password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? "border-error" : ""}`}
            placeholder="Repeat your password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center text-sm mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
  );
}