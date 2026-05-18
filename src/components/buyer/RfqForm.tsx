import { getDb } from "@/db";
import { commodities } from "@/db/schema";

import { DemandForm } from "./DemandForm";

const db = getDb();

export default async function QuoteForm() {
    const commoditiesList = await db
        .select()
        .from(commodities)
        .orderBy(commodities.sortOrder);

    return (
        <DemandForm isRfq={true} commodities={commoditiesList} />
    );
}
