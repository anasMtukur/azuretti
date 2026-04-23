"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const { error: toastError } = useToast();
    const [showPw, setShowPw]   = useState(false);
    const callbackUrl = searchParams.get("callbackUrl") ?? "/portal/dashboard";

    const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormData) {
        const res = await signIn("credentials", {
            email:    data.email,
            password: data.password,
            redirect: false,
        });

        if (res?.error) {
            toastError("Sign-in failed", res.error);
            return;
        }

        router.push(callbackUrl);
        router.refresh();
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
            <label htmlFor="email" className="label">
                Email address
            </label>
            <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? "border-error focus:ring-error" : ""}`}
                placeholder="you@company.com"
                {...register("email")}
            />
            {errors.email && (
                <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>
            )}
            </div>

            {/* Password */}
            <div>
            <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">
                Password
                </label>
                <Link
                href="/auth/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-800 transition-colors"
                >
                Forgot password?
                </Link>
            </div>
            <div className="relative">
                <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                className={`input pr-10 ${errors.password ? "border-error focus:ring-error" : ""}`}
                placeholder="••••••••"
                {...register("password")}
                />
                <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
                >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {errors.password && (
                <p className="mt-1.5 text-xs text-error">{errors.password.message}</p>
            )}
            </div>

            {/* Submit */}
            <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center text-sm mt-2"
            >
            {isSubmitting ? (
                <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
                </>
            ) : (
                "Sign In"
            )}
            </button>
        </form>
    );
}