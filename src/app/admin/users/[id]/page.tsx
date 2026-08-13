import { requireRole } from "@/lib/auth/helpers";
import { getDb } from "@/db";
import { users } from "@/db/schema";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AdminUserForm } from "@/components/admin/AdminUserForm";

const db = getDb();

export const metadata = { title: "Edit User – Admin" };

export default async function AdminUserEditPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["admin"]);

  const isNew = params.id === "new";
  let user = null;
  
  if (!isNew) {
    const [found] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);
    
    user = found;
  }
  //if (!user) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-neutral-900">{isNew ? 'Create User' : 'Edit User'}</h1>
        <p className="text-sm text-neutral-500 mt-1">{isNew ? 'Create a new user' : 'Update existing user'}</p>
      </div>
      <div className="card p-8">
        <AdminUserForm user={user} />
      </div>
    </div>
  );
}
