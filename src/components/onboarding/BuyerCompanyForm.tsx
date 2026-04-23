import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const buyerSchema = z.object({
  companyName:    z.string().min(2,  "Company name is required"),
  companyEmail:   z.string().email("Enter a valid company email"),
  companyWebsite: z.string().url("Enter a valid company website URL"),
  registrationNo: z.string().min(2,  "Company registration number is required"),
  companyAddress: z.string().min(5,  "Company address is required"),
  country:        z.string().min(2,  "Country is required"),
  city:           z.string().optional(),
  phone:          z.string().optional(),
  businessType:   z.enum(
    ["importer", "distributor", "wholesaler", "food_manufacturer", "other"],
    { required_error: "Select your business type" }
  ),
});

export type BuyerData = z.infer<typeof buyerSchema>;

const BUSINESS_TYPES = [
  { value: "importer",          label: "Importer" },
  { value: "distributor",       label: "Distributor" },
  { value: "wholesaler",        label: "Wholesaler" },
  { value: "food_manufacturer", label: "Food Manufacturer / Processor" },
  { value: "other",             label: "Other" },
];

export default function BuyerCompanyForm({
  onNext,
}: {
  onNext: (data: BuyerData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuyerData>({ resolver: zodResolver(buyerSchema) });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Company name */}
        <div className="sm:col-span-2">
          <label className="label">
            Company Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.companyName ? "border-error" : ""}`}
            placeholder="e.g. Dupont Foods S.A.S."
            autoFocus
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="mt-1.5 text-xs text-error">{errors.companyName.message}</p>
          )}
        </div>

        {/* Company email */}
        <div>
          <label className="label">
            Company Email Address <span className="text-error">*</span>
          </label>
          <input
            type="email"
            className={`input ${errors.companyEmail ? "border-error" : ""}`}
            placeholder="info@yourcompany.eu"
            {...register("companyEmail")}
          />
          {errors.companyEmail && (
            <p className="mt-1.5 text-xs text-error">{errors.companyEmail.message}</p>
          )}
        </div>

        {/* Company email */}
        <div>
          <label className="label">
            Company Website <span className="text-error">*</span>
          </label>
          <input
            type="email"
            className={`input ${errors.companyWebsite ? "border-error" : ""}`}
            placeholder="https://yourcompany.co.eu"
            {...register("companyWebsite")}
          />
          {errors.companyWebsite && (
            <p className="mt-1.5 text-xs text-error">{errors.companyWebsite.message}</p>
          )}
        </div>

        {/* Registration number */}
        <div>
          <label className="label">
            Company Registration Number <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.registrationNo ? "border-error" : ""}`}
            placeholder="e.g. SIREN 123 456 789"
            {...register("registrationNo")}
          />
          {errors.registrationNo && (
            <p className="mt-1.5 text-xs text-error">{errors.registrationNo.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="label">
            Country <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.country ? "border-error" : ""}`}
            placeholder="e.g. France"
            {...register("country")}
          />
          {errors.country && (
            <p className="mt-1.5 text-xs text-error">{errors.country.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="label">City</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Paris"
            {...register("city")}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            className="input"
            placeholder="+33 ..."
            {...register("phone")}
          />
        </div>

        {/* Company address */}
        <div className="sm:col-span-2">
          <label className="label">
            Company Address <span className="text-error">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.companyAddress ? "border-error" : ""}`}
            placeholder="Full registered address"
            {...register("companyAddress")}
          />
          {errors.companyAddress && (
            <p className="mt-1.5 text-xs text-error">{errors.companyAddress.message}</p>
          )}
        </div>

        {/* Business type */}
        <div className="sm:col-span-2">
          <label className="label">
            Business Type <span className="text-error">*</span>
          </label>
          <select
            className={`input bg-white ${errors.businessType ? "border-error" : ""}`}
            defaultValue=""
            {...register("businessType")}
          >
            <option value="" disabled>Select your type</option>
            {BUSINESS_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.businessType && (
            <p className="mt-1.5 text-xs text-error">{errors.businessType.message}</p>
          )}
        </div>
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
