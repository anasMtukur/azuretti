"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { User } from "@/db/schema";

const schema = z.object({
  name:      z.string().min(2, "Name required"),
  email:     z.string().email("Valid email required"),
  role:      z.enum(["admin", "exporter", "buyer", "investor", "farmer"]),
  adminRole: z.enum(["system_admin", "warehouse_manager", "content_manager", "finance_manager"]),
  isActive:  z.boolean(),
  password:  z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AdminUserFormProps {
  user: User | null;
}

export function AdminUserForm({ user }: AdminUserFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const isNew = !user;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:     user?.name ?? "",
      email:    user?.email,
      role:     user?.role as FormData["role"],
      adminRole: user?.adminRole as FormData["adminRole"],
      isActive: user?.isActive,
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    const url = isNew ? `/api/admin/users` :  `/api/admin/users/${user?.id}`;
    const res = await fetch(url, {
      method:  isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      success("User updated", "Changes saved successfully.");
      router.refresh();
    } else {
      const json = await res.json();
      error("Update failed", json.error ?? "Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input type="text" className={`input ${errors.name ? "border-error" : ""}`} {...register("name")} />
          {errors.name && <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className={`input ${errors.email ? "border-error" : ""}`} {...register("email")} />
          {errors.email && <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Role</label>
          <select className="input bg-white" {...register("role")}>
            <option value="admin">Admin</option>
            <option value="exporter">Exporter</option>
            <option value="buyer">Buyer</option>
            <option value="investor">Investor</option>
            <option value="farmer">Farmer / Supplier</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input bg-white" {...register("isActive", { setValueAs: (v) => v === "true" || v === true })}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-neutral-700">Admin Role</label>
        <select
          {...register("adminRole")}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">— None (generic admin) —</option>
          <option value="system_admin">System Admin</option>
          <option value="warehouse_manager">Warehouse Manager</option>
          <option value="content_manager">Content Manager</option>
          <option value="finance_manager">Finance Manager</option>
        </select>
        <p className="text-xs text-neutral-400">Controls which sections this admin can access.</p>
      </div>

      <div>
        <label className="label">New password <span className="text-neutral-400 font-normal">(leave blank to keep current)</span></label>
        <input
          type="password"
          className="input"
          placeholder="Enter new password to change"
          {...register("password")}
          autoComplete="new-password"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-5 py-2.5">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
        <button type="button" onClick={() => history.back()} className="btn-ghost text-sm px-4 py-2.5">
          Cancel
        </button>
      </div>
    </form>
  );
}