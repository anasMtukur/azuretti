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

title: "Connecting Nigerian Excellence to European Markets.",

subtitle: "",

image: "/images/slide-5.jpg",

},

{

eyebrow: "Euro-Based Revenue",

title: "Your Gateway for Nigerian Exports to France and Europe",

subtitle: "",

image: "/images/slide-1.jpg",

},

{

eyebrow: "France Trade House Hub",

title: "Reach 500 Million Consumers",

subtitle: "",

image: "/images/slide-7.jpeg",

}

];

export function StatsSection() {
  return (
    <section className="bg-white py-14 px-14" aria-label="Key statistics">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
        <div className="">
          <Carousel slides={slides} />
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-2 bg-primary-600">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-3 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Icon className="h-6 w-6 text-accent-300" />
              </div>
              <div>
                <div className="font-display font-bold text-lg lg:text-3xl text-white leading-none mb-1">
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
