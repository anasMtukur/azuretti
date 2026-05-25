import type { Metadata } from "next";
import { ContactForm } from "@/components/website/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { theme } from "@/config/theme";
import { HeroSubSection } from "@/components/website/sections/HeroSubSection";

export const metadata: Metadata = {
  title: "Contact Azuretti",
  description:
    "Contact the Azuretti team for export inquiries, buyer onboarding or partnership opportunities.",
};

export default function ContactPage() {
  return (
    <>
      <HeroSubSection
        type="contact"
        tagText="Contact Us"
        title="Let's start the conversation"
        description="Our team in Nigeria and France is ready to guide you — whether you're an exporter, buyer, investor or institution."
      />

      {/* Main content */}
      <section className="section-padding bg-white">
        <div className="container-theme">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left — info */}
            <div className="lg:col-span-4">
              <h2 className="font-display font-bold text-2xl text-neutral-900 mb-6">
                Our offices
              </h2>

              {/* Locations */}
              <div className="space-y-6 mb-10">
                {theme.locations.map((loc) => (
                  <div key={loc.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm mb-0.5">
                        {loc.flag} {loc.city}, {loc.country}
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-1.5">
                        {loc.address}
                      </p>
                      {loc.phone && (
                        <a
                          href={`tel:${loc.phone}`}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                        >
                          {loc.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct contacts */}
              <div className="space-y-3 mb-10">
                <a
                  href={`tel:${theme.brand.phoneNigeria}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-primary-50 transition-all duration-150 group"
                >
                  <Phone className="h-4 w-4 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Nigeria</p>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {theme.brand.phoneNigeria}
                    </p>
                  </div>
                </a>
                <a
                  href={`tel:${theme.brand.phoneFrance}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-primary-50 transition-all duration-150 group"
                >
                  <Phone className="h-4 w-4 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">France</p>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {theme.brand.phoneFrance}
                    </p>
                  </div>
                </a>
                <a
                  href={`mailto:${theme.brand.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-primary-50 transition-all duration-150 group"
                >
                  <Mail className="h-4 w-4 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {theme.brand.email}
                    </p>
                  </div>
                </a>
              </div>

              {/* Response time */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-50 border border-accent-200">
                <Clock className="h-4 w-4 text-accent-600 mt-0.5 shrink-0" />
                <p className="text-xs text-accent-800 leading-relaxed">
                  We aim to respond to all enquiries within one business day.
                  For urgent matters, please call us directly.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-border shadow-lg p-8">
                <h2 className="font-display font-bold text-2xl text-neutral-900 mb-2">
                  Send us a message
                </h2>
                <p className="text-sm text-neutral-500 mb-8">
                  Fill in the form below and a member of our team will be in touch.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
