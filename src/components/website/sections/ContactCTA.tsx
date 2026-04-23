import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { theme } from "@/config/theme";

export function ContactCTA() {
  return (
    <section className="section-padding bg-accent-50" aria-label="Contact">
      <div className="container-theme">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <span className="section-label mb-5">Get In Touch</span>
            <h2 className="font-display font-bold text-neutral-900 mb-4">
              Ready to start your<br />export journey?
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Whether you're a Nigerian exporter, a European buyer, an investor or
              a farmer — our team is ready to guide you through the process.
            </p>

            <div className="space-y-4 mb-8">
              {theme.locations.map((loc) => (
                <div key={loc.id} className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {loc.flag} {loc.city}, {loc.country}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{loc.address}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${theme.brand.phoneNigeria}`}
                className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {theme.brand.phoneNigeria}
              </a>
              <a
                href={`mailto:${theme.brand.email}`}
                className="flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {theme.brand.email}
              </a>
            </div>
          </div>

          {/* Right — mini contact form preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
            <h3 className="font-display font-bold text-xl text-neutral-900 mb-1">
              Send us a message
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Fill in the form and our team will get back to you within one business day.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <div className="input bg-neutral-50 text-neutral-400 cursor-not-allowed text-sm">
                    Your full name
                  </div>
                </div>
                <div>
                  <label className="label">Company</label>
                  <div className="input bg-neutral-50 text-neutral-400 cursor-not-allowed text-sm">
                    Your company
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="input bg-neutral-50 text-neutral-400 cursor-not-allowed text-sm">
                  your@email.com
                </div>
              </div>
              <div>
                <label className="label">I am a…</label>
                <div className="input bg-neutral-50 text-neutral-400 cursor-not-allowed text-sm flex items-center justify-between">
                  <span>Exporter / Buyer / Investor / Other</span>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="btn-primary w-full justify-center mt-6 text-sm"
            >
              Go to full contact form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
