import { cn } from "@/lib/utils";

const planStyles = {
  drop: "bg-surface/50 text-muted border border-border/30 nm-badge",
  spark: "bg-accent-bg text-accent border border-accent/20 nm-badge",
  rush: "bg-accent text-white nm-btn-accent px-2.5 py-0.5",
  apex: "bg-text text-bg nm-badge",
};

const planLabels = {
  drop: "Drop",
  spark: "Spark",
  rush: "Rush",
  apex: "Apex",
};

export default function StatusBadge({ plan, className }) {
  const key = (plan || "drop").toLowerCase();
  const style = planStyles[key] || planStyles.drop;
  const label = planLabels[key] || plan;

  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", style, className)}
    >
      {label}
    </span>
  );
}
