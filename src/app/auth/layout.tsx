import Link from "next/link";
import { theme } from "@/config/theme";
import { Logo } from "@/components/website/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-hero p-12 relative overflow-hidden">
        {/* Dots pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        {/* Glow */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Logo */}
        <Logo />

        {/* Quote block */}
        <div className="relative z-10">
          <blockquote className="text-2xl font-display font-semibold text-white leading-snug mb-6">
            "Your compliant gateway to Europe's{" "}
            <span className="text-accent-400">500 million</span> consumers."
          </blockquote>
          <div className="flex flex-col gap-3">
            {[
              "EU-compliant & fully traceable supply chains",
              "Warehousing in Nigeria and France",
              "Bureau Veritas & SGS certified quality",
            ].map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-primary-200">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-primary-400">
          © {new Date().getFullYear()} {theme.brand.fullName}
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-display font-bold text-base">A</span>
          </div>
          <span className="font-display font-bold text-primary-700 text-lg">
            {theme.brand.name}
          </span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
