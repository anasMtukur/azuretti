"use client";

import RegisterClient from "@/components/auth/RegisterClient";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-neutral-900 mb-2">
          Create your account
        </h1>
        <p className="text-sm text-neutral-500">
          Join the Azuretti Trade House platform — free to sign up.
        </p>
      </div>

      <Suspense fallback={null}>
        <RegisterClient />
      </Suspense>

      <p className="text-sm text-neutral-500 text-center mt-8">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary-600 hover:text-primary-800 transition-colors"
        >
          Sign in
        </Link>
      </p>

      <p className="text-[11px] text-neutral-400 text-center mt-4 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline hover:text-neutral-600">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-neutral-600">Privacy Policy</Link>.
      </p>
    </div>
  );
}
