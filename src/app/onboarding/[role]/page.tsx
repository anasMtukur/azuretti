import { db } from "@/db";
import { commodities } from "@/db/schema";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function Page({ params }: { params: { role: string } }) {
  const commodityOptions = await db
    .select()
    .from(commodities)
    .orderBy(commodities.sortOrder);

  return (
    <OnboardingForm
      params={params}
      commodityOptions={commodityOptions}
    />
  );
}