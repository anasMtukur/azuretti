import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?:       string;
  title:        string;
  description?: string;
  align?:       "left" | "center";
  className?:   string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" && "text-center mx-auto", className)}>
      {label && (
        <span
          className={cn(
            "section-label mb-4",
            align === "center" && "justify-center"
          )}
        >
          {label}
        </span>
      )}
      <h2 className="font-display font-bold text-neutral-900">{title}</h2>
      {description && (
        <p
          className={cn(
            "mt-3 text-neutral-600 leading-relaxed",
            align === "center" && "max-w-xl mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
