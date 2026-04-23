import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const exporterSchema = z.object({
  companyName:     z.string().min(2,  "Company name is required"),
  companyEmail:    z.string().email("Enter a valid company email"),
  rcNumber:        z.string().min(2,  "RC Number is required"),
  exportLicense:   z.string().optional(),
  directorName:    z.string().min(2,  "Director's name is required"),
  directorNin:     z.string()
    .regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  phone:           z.string().optional(),
  state:           z.string().optional(),
  address:         z.string().optional(),
});

export type ExporterData = z.infer<typeof exporterSchema>;

export default function ExporterCompanyForm({
  onNext,
}: {
  onNext: (data: ExporterData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExporterData>({ resolver: zodResolver(exporterSchema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Company name */}
        <div className="sm:col-span-2">
          <label className="label">
            Company / Business Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.companyName ? "border-error" : ""}`}
            placeholder="e.g. Kano Agri Exports Ltd."
            autoFocus
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="mt-1.5 text-xs text-error">{errors.companyName.message}</p>
          )}
        </div>

        {/* Company Email */}
        <div>
          <label className="label">
            Company Email Address <span className="text-error">*</span>
          </label>
          <input
            type="email"
            className={`input ${errors.companyEmail ? "border-error" : ""}`}
            placeholder="info@yourcompany.ng"
            {...register("companyEmail")}
          />
          {errors.companyEmail && (
            <p className="mt-1.5 text-xs text-error">{errors.companyEmail.message}</p>
          )}
        </div>

        {/* RC Number */}
        <div>
          <label className="label">
            RC Number (CAC) <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.rcNumber ? "border-error" : ""}`}
            placeholder="e.g. RC1234567"
            {...register("rcNumber")}
          />
          {errors.rcNumber && (
            <p className="mt-1.5 text-xs text-error">{errors.rcNumber.message}</p>
          )}
        </div>

        {/* Export licence */}
        <div>
          <label className="label">
            Export Licence Number{" "}
            <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. EXP-2025-000123"
            {...register("exportLicense")}
          />
        </div>

        {/* Director name */}
        <div>
          <label className="label">
            Director's Full Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.directorName ? "border-error" : ""}`}
            placeholder="e.g. Musa Ibrahim"
            {...register("directorName")}
          />
          {errors.directorName && (
            <p className="mt-1.5 text-xs text-error">{errors.directorName.message}</p>
          )}
        </div>

        {/* Director NIN */}
        <div>
          <label className="label">
            Director's NIN{" "}
            <span className="text-error">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={11}
            className={`input font-mono tracking-widest ${errors.directorNin ? "border-error" : ""}`}
            placeholder="11-digit NIN"
            {...register("directorNin")}
          />
          {errors.directorNin ? (
            <p className="mt-1.5 text-xs text-error">{errors.directorNin.message}</p>
          ) : (
            <p className="mt-1.5 text-xs text-neutral-400">
              Used for KYC verification only. Stored securely and never shared.
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label">Business Phone</label>
          <input
            type="tel"
            className="input"
            placeholder="+234 ..."
            {...register("phone")}
          />
        </div>

        {/* State */}
        <div>
          <label className="label">State</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Kano, Lagos"
            {...register("state")}
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="label">Business Address</label>
          <input
            type="text"
            className="input"
            placeholder="Full address"
            {...register("address")}
          />
        </div>
      </div>

      {/* KYC notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary-50 border border-primary-100">
        <ShieldCheck className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-800 leading-relaxed">
          Your RC Number, Export Licence and Director's NIN are used solely for KYC/compliance
          verification in line with Nigerian Export Promotion Council requirements. This data
          is stored securely and is never shared without your consent.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
