import type { Metadata } from "next";
import { theme } from "@/config/theme";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `${theme.brand.name} – ${theme.brand.description}`,
  description: theme.brand.description,
};

// Section imports (to be built out in subsequent phases)
import { HeroSection }         from "@/components/website/sections/HeroSection";
import { ValuePropsSection }   from "@/components/website/sections/ValuePropsSection";
import { StatsSection }        from "@/components/website/sections/StatsSection";
import { CommoditiesPreview }  from "@/components/website/sections/CommoditiesPreview";
import { PortalsCTA }          from "@/components/website/sections/PortalsCTA";
import { ComplianceHighlight } from "@/components/website/sections/ComplianceHighlight";
import { PartnersBand }        from "@/components/website/sections/PartnersBand";
import { ContactCTA }          from "@/components/website/sections/ContactCTA";

export default function Page() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ValuePropsSection />
      <CommoditiesPreview />
      <PortalsCTA />
      <ComplianceHighlight />
      <PartnersBand />
      <ContactCTA />
    </>
  );
}
