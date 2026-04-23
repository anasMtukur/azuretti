import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { count, eq, ilike, or, and } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserPlus, Search, MailOpen, LucideEye } from "lucide-react";

export const metadata = { title: "Contacts – Admin" };

const ROLES = ["all", "admin", "exporter", "buyer", "investor", "farmer"] as const;

const roleColors: Record<string, string> = {
  admin:    "bg-purple-100 text-purple-700",
  exporter: "bg-primary-100 text-primary-700",
  buyer:    "bg-blue-100 text-blue-700",
  investor: "bg-amber-100 text-amber-700",
  farmer:   "bg-green-100 text-green-700",
};

interface Props {
  searchParams: { role?: string; q?: string; page?: string };
}

const PAGE_SIZE = 20;

export default async function AdminContactsPage({ searchParams }: Props) {
  await requireRole(["admin"]);

  const roleFilter = ROLES.includes(searchParams.role as any) && searchParams.role !== "all"
    ? searchParams.role as typeof ROLES[number]
    : undefined;
  const query    = searchParams.q?.trim() ?? "";
  const page     = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset   = (page - 1) * PAGE_SIZE;

  // Build where conditions
  const conditions = [];
  if (query) {
    conditions.push(or(ilike(contactSubmissions.email, `%${query}%`), ilike(contactSubmissions.name, `%${query}%`))!);
  }

  const where =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
      ? conditions[0]
      : and(...conditions);

  const [allContacts, [{ total }]] = await Promise.all([
    db.select({
      id: contactSubmissions.id, 
      name: contactSubmissions.name, 
      email: contactSubmissions.email,
      phone: contactSubmissions.phone, 
      company: contactSubmissions.company, 
      message: contactSubmissions.message, 
      role: contactSubmissions.role, 
      isRead: contactSubmissions.isRead, 
      createdAt: contactSubmissions.createdAt,
    })
    .from(contactSubmissions)
    // @ts-ignore — dynamic where
    .where(where)
    .orderBy(contactSubmissions.createdAt)
    .limit(PAGE_SIZE)
    .offset(offset),

    db.select({ total: count() }).from(contactSubmissions)
    // @ts-ignore
    .where(where),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Contact Submissions</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} total accounts</p>
        </div>
        
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or email…"
            className="input pl-9 py-2 text-sm"
          />
          {/* Keep role param across searches */}
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
        </form>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <Link
              key={r}
              href={`/admin/users${r === "all" ? "" : `?role=${r}`}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border transition-all ${
                (r === "all" && !roleFilter) || r === roleFilter
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-border hover:border-neutral-300"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Sent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {allContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                allContacts.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600 shrink-0">
                          {(u.name ?? u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{u.name ?? <span className="text-neutral-400 italic">No name</span>}</p>
                          <p className="text-xs text-neutral-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {u.company}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${roleColors[u.role || "exporter"] ?? "bg-neutral-100 text-neutral-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isRead ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.isRead ? "Read" : "Waiting"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        title="Read Message"
                        href={"#"}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <LucideEye className="h-4 w-4 text-neutral-400"/>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Page {page} of {totalPages} — {total} users
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/users?page=${page - 1}${roleFilter ? `&role=${roleFilter}` : ""}${query ? `&q=${query}` : ""}`}
                  className="px-3 py-1.5 text-xs rounded border border-border bg-white hover:bg-neutral-50 transition-colors">
                  ← Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/users?page=${page + 1}${roleFilter ? `&role=${roleFilter}` : ""}${query ? `&q=${query}` : ""}`}
                  className="px-3 py-1.5 text-xs rounded border border-border bg-white hover:bg-neutral-50 transition-colors">
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
