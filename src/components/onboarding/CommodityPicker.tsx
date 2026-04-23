import theme from "@/config/theme";
import { Tag, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Commodity } from "./OnboardingForm";

type Category = keyof typeof theme.commodityColors;

const categoryLabels: Record<string, string> = {
  pulses: "Pulses",
  grains: "Grains",
  seeds: "Seeds",
  nuts: "Nuts",
};

export default function CommodityPicker({
  commodityOptions,
  role,
  onBack,
  onFinish,
  submitting,
}: {
  commodityOptions: Commodity[],
  role: string | undefined;
  onBack: () => void;
  onFinish: (ids: string[]) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3)  return prev;
      return [...prev, id];
    });
  }

  const grouped = commodityOptions.reduce<Record<string, typeof commodityOptions>>(
    (acc, c) => { (acc[c.category] ??= []).push(c); return acc; },
    {}
  );

  const isBuyer    = role === "buyer";
  const maxLabel   = isBuyer ? "3" : "3";
  const prompt     = isBuyer
    ? "Select 1–3 commodities you're most interested in sourcing."
    : "Select 1–3 commodities you produce or plan to export.";

  return (
    <div className="space-y-6">
      {/* Counter badge */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          selected.length === 0
            ? "bg-neutral-50 text-neutral-400"
            : selected.length < 3
            ? "bg-primary-50 text-primary-700 border border-primary-100"
            : "bg-accent-50 text-accent-800 border border-accent-200"
        }`}
      >
        <Tag className="h-4 w-4 shrink-0" />
        {selected.length === 0
          ? `Select up to ${maxLabel} commodities`
          : selected.length === 3
          ? "3 selected — maximum reached"
          : `${selected.length} of ${maxLabel} selected`}
      </div>

      {/* Grouped picker */}
      {Object.entries(grouped).map(([cat, items]) => {
        const colors = theme.commodityColors[cat as Category] ?? theme.commodityColors.default;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                {categoryLabels[cat] ?? cat}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {items.map(({ id, name }) => {
                const isSelected = selected.includes(id);
                const maxed = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={maxed}
                    onClick={() => toggle(id)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-sm font-medium transition-all duration-150 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 text-primary-800 shadow-sm"
                        : maxed
                        ? "border-border bg-neutral-50 text-neutral-300 cursor-not-allowed"
                        : "border-border text-neutral-700 hover:border-primary-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-primary-600 bg-primary-600" : "border-neutral-300"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          disabled={submitting || selected.length === 0}
          onClick={() => onFinish(selected)}
          className="btn-primary w-full justify-center"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Go to my dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onFinish([])}
          disabled={submitting}
          className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors py-1"
        >
          Skip — I'll set preferences later
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="inline h-3 w-3 mr-1" />
          Back
        </button>
      </div>
    </div>
  );
}
