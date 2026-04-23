import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserPlus, Search } from "lucide-react";

export const metadata = { title: "Users – Admin" };

const DB_ROLES = ["admin", "exporter", "buyer", "investor", "farmer"] as const;
type DbRole = typeof DB_ROLES[number];

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

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireRole(["admin"]);

  const roleParam = searchParams.role;
  const roleFilter: DbRole | undefined =
    DB_ROLES.includes(roleParam as DbRole)
      ? (roleParam as DbRole)
      : undefined;

  const query    = searchParams.q?.trim() ?? "";
  const page     = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset   = (page - 1) * PAGE_SIZE;

  // Build where conditions
  const conditions = [];
  if (roleFilter) conditions.push(eq(users.role, roleFilter));
  if (query)      conditions.push(or(ilike(users.email, `%${query}%`), ilike(users.name, `%${query}%`))!);

  const where =
  conditions.length === 0
    ? undefined
    : conditions.length === 1
    ? conditions[0]
    : and(...conditions);

  const [allUsers, [{ total }]] = await Promise.all([
    db.select({
      id: users.id, name: users.name, email: users.email,
      role: users.role, isActive: users.isActive, createdAt: users.createdAt,
    })
    .from(users)
    // @ts-ignore — dynamic where
    .where(where)
    .orderBy(users.createdAt)
    .limit(PAGE_SIZE)
    .offset(offset),

    db.select({ total: count() }).from(users)
    // @ts-ignore
    .where(where),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-neutral-900">Users</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} total accounts</p>
        </div>
        <Link href="/admin/users/new" className="btn-primary text-sm px-4 py-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Link>
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
          {[...DB_ROLES, "all"].map((r) => (
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                allUsers.map((u) => (
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
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${roleColors[u.role] ?? "bg-neutral-100 text-neutral-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        Edit →
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
