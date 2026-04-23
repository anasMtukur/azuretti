import { Award, BarChart3, Package, Warehouse } from "lucide-react";

const stats = [
  { value: "15+",      label: "Years of agricultural export experience", icon: Award },
  { value: "150+ MT",  label: "Metric tonnes shipped",                   icon: Package },
  { value: "99%",      label: "Quality acceptance rate",                 icon: BarChart3 },
  { value: "7,500 MT", label: "Combined warehouse capacity (NG + FR)",   icon: Warehouse },
];

export function StatsSection() {
  return (
    <section className="bg-primary-600 py-14" aria-label="Key statistics">
      <div className="container-theme">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Icon className="h-6 w-6 text-accent-300" />
              </div>
              <div>
                <div className="font-display font-bold text-3xl text-white leading-none mb-1">
                  {value}
                </div>
                <div className="text-sm text-primary-200 leading-snug">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
