import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-neutral-900 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-500">
          Sign in to your Azuretti account to continue.
        </p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-sm text-neutral-500 text-center mt-8">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary-600 hover:text-primary-800 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
