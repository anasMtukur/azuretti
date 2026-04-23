import { requireRole } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";

export default async function AdminWarehousePage() {
  await requireRole(["admin"]);
  redirect("/admin/warehouse/receipts");
}