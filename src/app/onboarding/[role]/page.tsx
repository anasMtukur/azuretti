import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import OnboardingForm from "@/components/onboarding/OnboardingForm";

const db = getDb();

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