"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  Configuration:  "There is a server configuration problem. Please contact support.",
  AccessDenied:   "You do not have permission to sign in.",
  Verification:   "The sign-in link has expired or has already been used.",
  OAuthCallback:  "There was a problem with the OAuth provider. Please try again.",
  Default:        "An unexpected error occurred. Please try signing in again.",
};

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") ?? "Default";
    const message = errorMessages[error] ?? errorMessages.Default;

    return (
        <>
            <h1 className="font-display font-bold text-2xl text-neutral-900 mb-2">
                Sign-in error
            </h1>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">{message}</p>

            <div className="flex flex-col gap-3">
                <Link href="/auth/login" className="btn-primary justify-center text-sm">
                    Try again
                </Link>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>
            </div>
        </>
    );

}