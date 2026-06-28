import { Award, BarChart3, Package, Warehouse } from "lucide-react";
import { Carousel } from "../Carousel";

const stats = [
  { value: "15+",      label: "Years of agricultural export experience", icon: Award },
  { value: "150+ MT",  label: "Metric tonnes shipped",                   icon: Package },
  { value: "99%",      label: "Quality acceptance rate",                 icon: BarChart3 },
  { value: "7,500 MT", label: "Combined warehouse capacity (NG + FR)",   icon: Warehouse },
];

const slides = [

{

eyebrow: "EU-Compliant & Traceable",

title: "Secure Your Export Gateway",

subtitle: "",

image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200",

},

{

eyebrow: "Euro-Based Revenue",

title: "Maximize Your Trade Returns",

subtitle: "",

image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200",

},

{

eyebrow: "France Trade House Hub",

title: "Reach 500 Million Consumers",

subtitle: "",

image: "https://images.unsplash.com/photo-1503917988258-f19782f4c9a1?auto=format&fit=crop&q=80&w=1200",

}

];

export function StatsSection() {
  return (
    <section className="bg-primary-600 py-14 px-14" aria-label="Key statistics">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
        <div className="bg-white">
          <Carousel slides={slides} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3 p-6"
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
