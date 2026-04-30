import { getPrices } from "@/db/queries/getPrices";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPrices();
  return Response.json(data);
}